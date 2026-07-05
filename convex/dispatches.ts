import { query, mutation, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { batchEnrichWithAgents, getAgentByName } from "./queryHelpers";

// AGT-308: Exponential backoff delays (in ms)
const RETRY_BACKOFF_MS = [
  1 * 60 * 1000,   // 1 minute
  5 * 60 * 1000,   // 5 minutes
  15 * 60 * 1000,  // 15 minutes
] as const;
const MAX_RETRIES = 3;

/**
 * Phase 5: Execution Engine - Dispatch Management
 * Handles command dispatching to agents (OpenClaw integration ready)
 */

// Create a new dispatch for an agent
export const create = mutation({
  args: {
    agentId: v.id("agents"),
    command: v.string(),
    payload: v.optional(v.string()),
    priority: v.optional(v.number()), // 0=URGENT, 1=HIGH, 2=NORMAL (default), 3=LOW
    isUrgent: v.optional(v.boolean()),
  },
  handler: async (ctx, { agentId, command, payload, priority, isUrgent }) => {
    const agent = await ctx.db.get(agentId);
    if (!agent) throw new Error("Agent not found");

    const dispatchId = await ctx.db.insert("dispatches", {
      agentId,
      command,
      payload,
      priority: priority ?? 2, // Default to NORMAL
      isUrgent: isUrgent ?? priority === 0,
      status: "pending",
      createdAt: Date.now(),
    });

    // AGT-247: Fire event bus notification for new dispatch
    const priorityMap = { 0: "urgent", 1: "high", 2: "normal", 3: "low" };
    await ctx.scheduler.runAfter(0, internal.agentEvents.publishEvent, {
      type: "dispatch",
      targetAgent: agent.name.toLowerCase(),
      payload: {
        dispatchId: dispatchId,
        message: `New dispatch: ${command}`,
        priority: (priorityMap as Record<number, "urgent" | "high" | "normal" | "low">)[priority ?? 2],
      },
    });

    return dispatchId;
  },
});

// Agent claims a pending dispatch (marks as running)
export const claim = mutation({
  args: {
    dispatchId: v.id("dispatches"),
  },
  handler: async (ctx, { dispatchId }) => {
    const dispatch = await ctx.db.get(dispatchId);
    if (!dispatch) throw new Error("Dispatch not found");
    if (dispatch.status !== "pending") {
      throw new Error(`Cannot claim dispatch with status: ${dispatch.status}`);
    }

    await ctx.db.patch(dispatchId, {
      status: "running",
      startedAt: Date.now(),
    });

    return dispatchId;
  },
});

// Mark dispatch as completed with result
export const complete = mutation({
  args: {
    dispatchId: v.id("dispatches"),
    result: v.optional(v.string()),
  },
  handler: async (ctx, { dispatchId, result }) => {
    const dispatch = await ctx.db.get(dispatchId);
    if (!dispatch) throw new Error("Dispatch not found");
    if (dispatch.status !== "running") {
      throw new Error(`Cannot complete dispatch with status: ${dispatch.status}`);
    }

    await ctx.db.patch(dispatchId, {
      status: "completed",
      completedAt: Date.now(),
      result,
    });

    return dispatchId;
  },
});

// Mark dispatch as failed with error
// AGT-308: Now includes auto-retry with exponential backoff
export const fail = mutation({
  args: {
    dispatchId: v.id("dispatches"),
    error: v.string(),
  },
  handler: async (ctx, { dispatchId, error }) => {
    const dispatch = await ctx.db.get(dispatchId);
    if (!dispatch) throw new Error("Dispatch not found");
    if (dispatch.status !== "running") {
      throw new Error(`Cannot fail dispatch with status: ${dispatch.status}`);
    }

    const currentRetry = dispatch.retryCount ?? 0;
    const maxRetries = dispatch.maxRetries ?? MAX_RETRIES;

    // AGT-308: Auto-retry with exponential backoff
    if (currentRetry < maxRetries) {
      const backoffMs = RETRY_BACKOFF_MS[Math.min(currentRetry, RETRY_BACKOFF_MS.length - 1)];
      const nextRetryAt = Date.now() + backoffMs;

      // Single patch with all fields to avoid write conflicts
      await ctx.db.patch(dispatchId, {
        status: "failed",
        completedAt: Date.now(),
        error,
        retryCount: currentRetry,
        nextRetryAt,
      });

      await ctx.scheduler.runAfter(backoffMs, internal.dispatches.retryFailedDispatch, {
        originalDispatchId: dispatchId,
      });

      console.log(
        `[AutoRetry] Dispatch ${dispatchId} failed (attempt ${currentRetry + 1}/${maxRetries}). Retrying in ${backoffMs / 60000}m.`
      );
    } else {
      // Max retries exhausted — single patch, then escalate to MAX
      await ctx.db.patch(dispatchId, {
        status: "failed",
        completedAt: Date.now(),
        error,
        retryCount: currentRetry,
      });
      await ctx.scheduler.runAfter(0, internal.dispatches.escalateFailedDispatch, {
        dispatchId,
      });
      console.log(
        `[AutoRetry] Dispatch ${dispatchId} failed after ${maxRetries} retries. Escalating to MAX.`
      );
    }

    // AGT-317: Check if this failure blocks other tasks
    let linearIdentifier: string | undefined;
    if (dispatch.payload) {
      try {
        const payload = JSON.parse(dispatch.payload);
        linearIdentifier = payload.identifier || payload.linearIdentifier;
      } catch {
        // payload not JSON, skip
      }
    }
    if (linearIdentifier) {
      await ctx.scheduler.runAfter(0, internal.blockerDetection.checkDependentsOfFailedTask, {
        taskLinearIdentifier: linearIdentifier,
      });
    }

    return dispatchId;
  },
});

// List all pending dispatches (with agent names), sorted by priority
// Optimized: uses batch agent lookup instead of N+1 queries
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    // Use priority index for pre-sorted results
    const dispatches = await ctx.db
      .query("dispatches")
      .withIndex("by_priority", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(50);

    // Batch enrich with agent names (single query instead of N)
    return batchEnrichWithAgents(ctx.db, dispatches);
  },
});

// List active dispatches (pending + running) for UI display
// Optimized: parallel queries + batch agent lookup
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    // Parallel fetch pending and running
    const [pending, running] = await Promise.all([
      ctx.db
        .query("dispatches")
        .withIndex("by_priority", (q) => q.eq("status", "pending"))
        .order("asc")
        .take(20),
      ctx.db
        .query("dispatches")
        .withIndex("by_status", (q) => q.eq("status", "running"))
        .order("asc")
        .take(10),
    ]);

    // Combine and sort by createdAt
    const all = [...running, ...pending].sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    );

    // Batch enrich with agent names (single query instead of N)
    return batchEnrichWithAgents(ctx.db, all);
  },
});

// List dispatches for a specific agent
export const listByAgent = query({
  args: {
    agentId: v.id("agents"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, { agentId, status }) => {
    if (status) {
      return await ctx.db
        .query("dispatches")
        .withIndex("by_agent", (q) => q.eq("agentId", agentId).eq("status", status))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("dispatches")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .order("desc")
      .collect();
  },
});

// Get a single dispatch by ID
export const get = query({
  args: { id: v.id("dispatches") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});


// Clean up duplicate pending dispatches (keep oldest)
export const cleanupDuplicates = mutation({
  args: {},
  handler: async (ctx) => {
    const pendingDispatches = await ctx.db
      .query("dispatches")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Group by agent + ticket identifier
    const groups = new Map<string, typeof pendingDispatches>();

    for (const d of pendingDispatches) {
      let ticketId = "unknown";
      try {
        const payload = JSON.parse(d.payload || "{}");
        ticketId = payload.identifier || payload.linearIdentifier || "unknown";
      } catch {
        // ignore
      }

      const key = `${d.agentId}-${ticketId}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(d);
    }

    // Delete duplicates (keep oldest by createdAt)
    let deleted = 0;
    for (const [_, dispatches] of groups) {
      if (dispatches.length > 1) {
        // Sort by createdAt ascending, keep first
        dispatches.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        for (let i = 1; i < dispatches.length; i++) {
          await ctx.db.delete(dispatches[i]._id);
          deleted++;
        }
      }
    }

    return { success: true, deleted };
  },
});

// Get dispatch queue summary for an agent
// Optimized: uses indexed agent lookup instead of collect-then-find
export const getQueueForAgent = query({
  args: { agentName: v.string() },
  handler: async (ctx, { agentName }) => {
    const agent = await getAgentByName(ctx.db, agentName);

    if (!agent) {
      return { error: "agent_not_found", pending: 0, running: 0 };
    }

    const pending = await ctx.db
      .query("dispatches")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id).eq("status", "pending"))
      .collect();

    const running = await ctx.db
      .query("dispatches")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id).eq("status", "running"))
      .collect();

    return {
      agentName: agent.name,
      pending: pending.length,
      running: running.length,
      pendingTickets: pending.map((d) => {
        try {
          const payload = JSON.parse(d.payload || "{}");
          return payload.identifier || payload.linearIdentifier || "unknown";
        } catch {
          return "unknown";
        }
      }),
    };
  },
});

// Cleanup stuck running dispatches (older than threshold)
export const cleanupStuckDispatches = mutation({
  args: {
    maxAgeMinutes: v.optional(v.number()), // Default 30 minutes
  },
  handler: async (ctx, { maxAgeMinutes }) => {
    const threshold = Date.now() - (maxAgeMinutes ?? 30) * 60 * 1000;

    const runningDispatches = await ctx.db
      .query("dispatches")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();

    const stuck = runningDispatches.filter(
      (d) => (d.startedAt ?? d.createdAt) < threshold
    );

    // Mark stuck dispatches as failed
    for (const d of stuck) {
      await ctx.db.patch(d._id, {
        status: "failed",
        completedAt: Date.now(),
        error: "Stuck dispatch - auto-cleaned after timeout",
      });
    }

    return { success: true, cleaned: stuck.length };
  },
});

// Force reset all running dispatches for an agent (emergency cleanup)
// Optimized: uses indexed agent lookup
export const resetAgentDispatches = mutation({
  args: {
    agentName: v.string(),
  },
  handler: async (ctx, { agentName }) => {
    const agent = await getAgentByName(ctx.db, agentName);

    if (!agent) {
      return { error: "agent_not_found", reset: 0 };
    }

    const running = await ctx.db
      .query("dispatches")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id).eq("status", "running"))
      .collect();

    for (const d of running) {
      await ctx.db.patch(d._id, {
        status: "failed",
        completedAt: Date.now(),
        error: "Force reset by admin",
      });
    }

    // Also reset agent status to idle
    await ctx.db.patch(agent._id, {
      status: "idle",
      statusReason: "Dispatches reset",
      currentTask: undefined,
    });

    return { success: true, reset: running.length, agentName: agent.name };
  },
});

// AGT-279: Create dispatch for PR code review (always dispatched to Quinn)
// Optimized: uses indexed agent lookup
export const createPRReviewDispatch = mutation({
  args: {
    prNumber: v.number(),
    prTitle: v.string(),
    prBody: v.optional(v.string()),
    prUrl: v.string(),
    repo: v.string(),
    branch: v.string(),
    baseBranch: v.string(),
    author: v.string(),
    action: v.string(), // "opened", "synchronize", "reopened"
  },
  handler: async (ctx, args) => {
    // Find Quinn agent using index (O(1) lookup)
    const quinn = await getAgentByName(ctx.db, "QUINN");

    if (!quinn) {
      console.log("Quinn agent not found, cannot dispatch PR review");
      return null;
    }

    // Check for existing pending/running dispatch for same PR
    const existingDispatches = await ctx.db
      .query("dispatches")
      .withIndex("by_agent", (q) => q.eq("agentId", quinn._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "running")
        )
      )
      .collect();

    const duplicate = existingDispatches.find((d) => {
      try {
        const payload = JSON.parse(d.payload || "{}");
        return payload.prNumber === args.prNumber && payload.repo === args.repo;
      } catch {
        return false;
      }
    });

    if (duplicate && args.action === "opened") {
      console.log(`Duplicate dispatch for PR #${args.prNumber}, skipping`);
      return duplicate._id;
    }

    // For synchronize (new commits), update existing dispatch or create new
    if (duplicate && args.action === "synchronize") {
      // Update existing dispatch with new info
      await ctx.db.patch(duplicate._id, {
        payload: JSON.stringify({
          command: "review_pr",
          prNumber: args.prNumber,
          prTitle: args.prTitle,
          prBody: args.prBody || "",
          prUrl: args.prUrl,
          repo: args.repo,
          branch: args.branch,
          baseBranch: args.baseBranch,
          author: args.author,
          action: args.action,
          updatedAt: Date.now(),
        }),
      });
      return duplicate._id;
    }

    const dispatchId = await ctx.db.insert("dispatches", {
      agentId: quinn._id,
      command: "review_pr",
      payload: JSON.stringify({
        prNumber: args.prNumber,
        prTitle: args.prTitle,
        prBody: args.prBody || "",
        prUrl: args.prUrl,
        repo: args.repo,
        branch: args.branch,
        baseBranch: args.baseBranch,
        author: args.author,
        action: args.action,
      }),
      priority: 1, // HIGH priority for PR reviews
      status: "pending",
      createdAt: Date.now(),
    });

    // Fire event bus notification
    await ctx.scheduler.runAfter(0, internal.agentEvents.publishEvent, {
      type: "dispatch",
      targetAgent: "quinn",
      payload: {
        dispatchId: dispatchId,
        message: `PR #${args.prNumber} needs review: ${args.prTitle}`,
        priority: "high",
      },
    });

    console.log(`Created PR review dispatch for Quinn: PR #${args.prNumber}`);
    return dispatchId;
  },
});

// ─── AGT-308: Auto-Retry Infrastructure ──────────────────────────────────

/**
 * Internal mutation: re-queue a failed dispatch as a new pending dispatch.
 * Preserves the original command, payload, agent, and increments retryCount.
 */
export const retryFailedDispatch = internalMutation({
  args: {
    originalDispatchId: v.id("dispatches"),
  },
  handler: async (ctx, { originalDispatchId }) => {
    const original = await ctx.db.get(originalDispatchId);
    if (!original) {
      console.log(`[AutoRetry] Original dispatch ${originalDispatchId} not found, skipping.`);
      return;
    }
    if (original.status !== "failed") {
      console.log(`[AutoRetry] Dispatch ${originalDispatchId} is ${original.status}, not failed. Skipping retry.`);
      return;
    }

    const nextRetry = (original.retryCount ?? 0) + 1;

    // Create a new dispatch with incremented retryCount
    const retryId = await ctx.db.insert("dispatches", {
      agentId: original.agentId,
      command: original.command,
      payload: original.payload,
      priority: original.priority,
      isUrgent: original.isUrgent,
      status: "pending",
      createdAt: Date.now(),
      retryCount: nextRetry,
      maxRetries: original.maxRetries ?? MAX_RETRIES,
      originalDispatchId: originalDispatchId,
    });

    // Clear the nextRetryAt on the original
    await ctx.db.patch(originalDispatchId, { nextRetryAt: undefined });

    console.log(
      `[AutoRetry] Retry #${nextRetry} created (${retryId}) for original ${originalDispatchId}.`
    );
  },
});

/**
 * Internal action: escalate a permanently failed dispatch to MAX (PM).
 * Called after max retries are exhausted.
 */
export const escalateFailedDispatch = internalAction({
  args: {
    dispatchId: v.id("dispatches"),
  },
  handler: async (ctx, { dispatchId }) => {
    const dispatch = await ctx.runQuery(internal.dispatches.getDispatchById, {
      dispatchId,
    });
    if (!dispatch) return;

    // Get agent name for the message
    const agent = await ctx.runQuery(internal.dispatches.getAgentById, {
      agentId: dispatch.agentId,
    });

    let taskLabel = "unknown";
    if (dispatch.payload) {
      try {
        const payload = JSON.parse(dispatch.payload);
        taskLabel = payload.identifier || payload.title || dispatch.command;
      } catch {
        taskLabel = dispatch.command;
      }
    }

    const agentName = agent?.name ?? "unknown agent";
    const retries = dispatch.retryCount ?? 0;

    await ctx.runMutation(api.messaging.sendDM, {
      from: "system",
      to: "max",
      content: `[AutoRetry FAILED] Dispatch for ${agentName} exhausted ${retries} retries.\nTask: ${taskLabel}\nLast error: ${dispatch.error ?? "unknown"}\nNeeds manual intervention.`,
      priority: "urgent" as const,
    });
  },
});

/**
 * Internal query: get dispatch by ID (for use in actions).
 */
export const getDispatchById = internalQuery({
  args: { dispatchId: v.id("dispatches") },
  handler: async (ctx, { dispatchId }) => {
    return await ctx.db.get(dispatchId);
  },
});

/**
 * Internal query: get agent by ID (for use in actions).
 */
export const getAgentById = internalQuery({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    return await ctx.db.get(agentId);
  },
});
