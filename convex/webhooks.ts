/**
 * Webhook Handlers (AGT-128: Max Visibility Pipeline)
 *
 * GitHub push → Parse AGT-XX → log activity, close local task on "closes AGT-XX"
 * Vercel deploy → Match commit → store event, log failures locally
 *
 * Linear integration removed — AGT-XX is now an internal-only ticket id.
 */
import { v } from "convex/values";
import { mutation, action, internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Regex to match ticket IDs like "AGT-123", "closes AGT-45", etc.
const TICKET_REGEX = /\b(AGT-\d+)\b/gi;

// Regex to detect "closes AGT-XX" pattern (task completion)
const CLOSES_REGEX = /closes\s+(AGT-\d+)/gi;

// Map GitHub usernames to agent names (for skill tracking)
const GITHUB_TO_AGENT: Record<string, string> = {
  "sonpiaz": "max",      // Son's GitHub → Max (PM)
  "sam-agent": "sam",    // SAM's commits
  "leo-agent": "leo",    // LEO's commits
  // Add more mappings as needed
};

/**
 * Store webhook event in database (internal)
 */
export const storeWebhookEvent = internalMutation({
  args: {
    source: v.union(v.literal("github"), v.literal("vercel")),
    eventType: v.string(),
    payload: v.string(),
    linearTicketId: v.optional(v.string()),
    commentPosted: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("webhookEvents", {
      source: args.source,
      eventType: args.eventType,
      payload: args.payload,
      linearTicketId: args.linearTicketId,
      commentPosted: args.commentPosted,
      createdAt: Date.now(),
    });
  },
});

/**
 * Process GitHub push event
 * Extract AGT-XX from commit messages and post comments to Linear
 */
export const processGitHubPush = action({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const payload = args.payload;

    // Only process pushes to main/master
    const ref = payload.ref || "";
    if (!ref.endsWith("/main") && !ref.endsWith("/master")) {
      return { processed: false, reason: "Not main branch" };
    }

    const commits = payload.commits || [];
    const results: Array<{ ticketId: string; success: boolean }> = [];

    for (const commit of commits) {
      const message = commit.message || "";
      const author = commit.author?.username || commit.author?.name || "unknown";
      const hash = (commit.id || "").slice(0, 7);
      const url = commit.url || "";

      // AGT-262: Get agent name for Slack notification
      const agentName = GITHUB_TO_AGENT[author.toLowerCase()] || null;
      const filesChanged = (commit.added?.length || 0) + (commit.modified?.length || 0) + (commit.removed?.length || 0);

      // Extract all AGT-XX ticket IDs from commit message
      const matches: RegExpMatchArray | null = message.match(TICKET_REGEX);

      // AGT-262: Send Slack notification even if no ticket ID found
      if (!matches) {
        if (agentName) {
          try {
            await ctx.runAction(internal.slackNotify.notifyGitPush, {
              agentName,
              commitHash: hash,
              commitMessage: message.split("\n")[0],
              filesChanged,
              commitUrl: url,
            });
          } catch (e) {
            console.error(`Failed to send Slack notification for ${hash}:`, e);
          }
        }
        continue;
      }

      // Deduplicate ticket IDs
      const ticketIds: string[] = Array.from(new Set(matches.map((m: string) => m.toUpperCase())));

      for (const ticketId of ticketIds) {
        // No external ticket system (Linear removed) — track the push locally only.
        results.push({ ticketId, success: true });

        // Store webhook event
        await ctx.runMutation(internal.webhooks.storeWebhookEvent, {
          source: "github" as const,
          eventType: "push",
          payload: JSON.stringify({ commit: hash, message: message.slice(0, 100) }),
          linearTicketId: ticketId,
          commentPosted: false,
        });

        // AGT-262: Send Slack notification for agent commits
        if (agentName) {
          try {
            await ctx.runAction(internal.slackNotify.notifyGitPush, {
              agentName,
              commitHash: hash,
              commitMessage: message.split("\n")[0],
              ticketId,
              filesChanged,
              commitUrl: url,
            });
          } catch (e) {
            console.error(`Failed to send Slack notification for ${hash}:`, e);
          }
        }
      }

      // AGT-132: Track skill completion when "closes AGT-XX" detected
      // AGT-168: Emit activityEvent with correct agent attribution from git author.
      //          logGitTaskCompletion also closes the local task (status → done).
      const closesMatches = message.match(CLOSES_REGEX);
      if (closesMatches && closesMatches.length > 0) {
        // Get agent name from git author FIRST
        const agentName = GITHUB_TO_AGENT[author.toLowerCase()] || "unknown";

        for (const match of closesMatches) {
          const closedTicketId = match.replace(/closes\s+/i, "").toUpperCase();

          // Emit activityEvent with correct attribution AND close the local task.
          if (agentName !== "unknown") {
            try {
              await ctx.runMutation(internal.activityEvents.logGitTaskCompletion, {
                agentName,
                linearIdentifier: closedTicketId,
                commitHash: hash,
                commitMessage: message.split("\n")[0],
              });
            } catch (e) {
              console.error(`Failed to log/close completion for ${closedTicketId}:`, e);
            }
          }
        }

        // Record skill completion for the first closed ticket
        if (agentName !== "unknown") {
          try {
            await ctx.runMutation(internal.webhooks.recordSkillCompletion, {
              agentName,
              ticketId: closesMatches[0].replace(/closes\s+/i, "").toUpperCase(),
              commitHash: hash,
            });
          } catch (e) {
            console.error("Failed to record skill completion:", e);
          }
        }
      }
    }

    return { processed: true, results };
  },
});

/**
 * Process Vercel deployment event
 * Store the event and log failures locally (Linear ticketing removed).
 */
const processVercelDeployAction = action({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, args): Promise<{
    processed: boolean;
    status?: string;
    results?: Array<{ ticketId: string; success: boolean }>;
    bugTicketCreated?: boolean;
    bugTicketId?: string;
  }> => {
    const payload = args.payload;
    const deploymentType = payload.type || "deployment";
    const deployment = payload.deployment || payload;

    const status = deployment.state || deployment.readyState || "unknown";
    const url = deployment.url ? `https://${deployment.url}` : deployment.inspectorUrl || "";
    const commitSha = deployment.meta?.githubCommitSha || deployment.gitSource?.sha || "";
    const commitMessage = deployment.meta?.githubCommitMessage || deployment.gitSource?.message || "";
    const hash = commitSha.slice(0, 7);

    // Extract ticket IDs from commit message
    const matches: RegExpMatchArray | null = commitMessage.match(TICKET_REGEX);
    const ticketIds: string[] = matches ? Array.from(new Set(matches.map((m: string) => m.toUpperCase()))) : [];

    const results: Array<{ ticketId: string; success: boolean }> = [];

    // Determine status emoji and label
    let statusEmoji = "🔄";
    let statusLabel = "Building";
    if (status === "READY" || status === "ready") {
      statusEmoji = "✅";
      statusLabel = "Deployed";
    } else if (status === "ERROR" || status === "error" || status === "FAILED") {
      statusEmoji = "❌";
      statusLabel = "Failed";
    } else if (status === "CANCELED" || status === "canceled") {
      statusEmoji = "⚠️";
      statusLabel = "Canceled";
    }

    // Mark matched tickets as touched by this deploy (no external comment).
    for (const ticketId of ticketIds) {
      results.push({ ticketId, success: true });
    }

    // Store webhook event
    await ctx.runMutation(internal.webhooks.storeWebhookEvent, {
      source: "vercel" as const,
      eventType: deploymentType,
      payload: JSON.stringify({ status, url, commit: hash, statusLabel, emoji: statusEmoji }),
      linearTicketId: ticketIds[0] || undefined,
      commentPosted: false,
    });

    // Log deploy failures locally (Linear bug-ticket creation removed).
    if (status === "ERROR" || status === "error" || status === "FAILED") {
      console.error(`🚨 [P0] Vercel deploy failed — ${hash} (${commitMessage.split("\n")[0]}) ${url}`);
    }

    return { processed: true, status, results };
  },
});

export const processVercelDeploy = processVercelDeployAction;

/**
 * List recent webhook events (for dashboard)
 */
export const listRecentEvents = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_created_at")
      .order("desc")
      .take(args.limit || 50);

    return events;
  },
});

/**
 * AGT-132: Record skill completion from webhook
 * Called when "closes AGT-XX" is detected in a commit message
 */
export const recordSkillCompletion = internalMutation({
  args: {
    agentName: v.string(),
    ticketId: v.string(),
    commitHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Find agent by name mapping
    const mapping = await ctx.db
      .query("agentMappings")
      .withIndex("by_name", (q) => q.eq("name", args.agentName.toLowerCase()))
      .first();

    if (!mapping) {
      console.log(`No agent mapping found for: ${args.agentName}`);
      return { success: false, reason: "Agent not found" };
    }

    // Find agent skills record
    const skills = await ctx.db
      .query("agentSkills")
      .withIndex("by_agent", (q) => q.eq("agentId", mapping.convexAgentId))
      .first();

    if (!skills) {
      console.log(`No skills record for agent: ${args.agentName}`);
      return { success: false, reason: "Skills not initialized" };
    }

    // Update task completion count
    const now = Date.now();
    await ctx.db.patch(skills._id, {
      tasksCompleted: skills.tasksCompleted + 1,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activities", {
      agent: mapping.convexAgentId,
      action: "completed_via_webhook",
      target: args.ticketId,
      metadata: { commitHash: args.commitHash, source: "github" },
      createdAt: now,
    });

    return {
      success: true,
      agent: args.agentName,
      ticketId: args.ticketId,
      tasksCompleted: skills.tasksCompleted + 1,
    };
  },
});
