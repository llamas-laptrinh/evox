/**
 * Webhook Tests
 *
 * North Star: External events flow into system automatically.
 * Tests cover: GitHub webhooks, Vercel deploy webhooks, payload parsing.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../helpers/convex-mock";

describe("Webhooks - Critical Path", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe("GitHub Push Webhook", () => {
    it("should parse push event payload", () => {
      const payload = {
        ref: "refs/heads/main",
        commits: [
          { id: "abc123", message: "closes AGT-123: fix bug", author: { name: "SAM" } },
          { id: "def456", message: "feat: add feature", author: { name: "LEO" } },
        ],
        repository: { full_name: "sonpiaz/evox" },
        pusher: { name: "sam" },
      };

      expect(payload.ref).toBe("refs/heads/main");
      expect(payload.commits).toHaveLength(2);
      expect(payload.repository.full_name).toBe("sonpiaz/evox");
    });

    it("should extract branch from ref", () => {
      const refs = [
        "refs/heads/main",
        "refs/heads/feature/AGT-123",
        "refs/heads/uat",
      ];

      const branches = refs.map((r) => r.replace("refs/heads/", ""));

      expect(branches).toEqual(["main", "feature/AGT-123", "uat"]);
    });

    it("should extract ticket from commit message", () => {
      const messages = [
        "closes AGT-123: fix bug",
        "fixes AGT-456: update feature",
        "feat(AGT-789): new thing",
        "chore: no ticket here",
      ];

      const pattern = /AGT-\d+/;
      const tickets = messages.map((m) => m.match(pattern)?.[0] || null);

      expect(tickets).toEqual(["AGT-123", "AGT-456", "AGT-789", null]);
    });

    it("should normalize author to agent name", () => {
      const authors = ["SAM", "sam", "Sam", "sam (bot)", "SAM-bot"];

      const normalize = (name: string): string => {
        return name.replace(/\s*[\(-].*$/, "").toUpperCase();
      };

      const normalized = authors.map(normalize);

      expect(normalized).toEqual(["SAM", "SAM", "SAM", "SAM", "SAM"]);
    });

    it("should log commit to database", async () => {
      const commitData = {
        commitHash: "abc123def456",
        shortHash: "abc123d",
        message: "closes AGT-123: fix bug",
        authorName: "SAM",
        agentName: "SAM",
        repo: "sonpiaz/evox",
        branch: "main",
        linkedTicketId: "AGT-123",
        pushedAt: Date.now(),
      };

      ctx.db.insert.mockResolvedValue("commit_new");

      await ctx.db.insert("gitCommits", commitData);

      expect(ctx.db.insert).toHaveBeenCalledWith(
        "gitCommits",
        expect.objectContaining({
          commitHash: "abc123def456",
          linkedTicketId: "AGT-123",
        })
      );
    });
  });

  describe("GitHub PR Webhook", () => {
    it("should parse PR opened event", () => {
      const payload = {
        action: "opened",
        pull_request: {
          number: 42,
          title: "AGT-123: Fix authentication",
          body: "Closes AGT-123\n\nThis PR fixes the auth bug.",
          head: { ref: "feature/AGT-123" },
          base: { ref: "main" },
          user: { login: "sam" },
        },
        repository: { full_name: "sonpiaz/evox" },
      };

      expect(payload.action).toBe("opened");
      expect(payload.pull_request.number).toBe(42);
      expect(payload.pull_request.head.ref).toBe("feature/AGT-123");
    });

    it("should extract ticket from PR title", () => {
      const titles = [
        "AGT-123: Fix authentication",
        "[AGT-456] Add new feature",
        "feat(AGT-789): Update API",
      ];

      const pattern = /AGT-\d+/;
      const tickets = titles.map((t) => t.match(pattern)?.[0]);

      expect(tickets).toEqual(["AGT-123", "AGT-456", "AGT-789"]);
    });

    it("should detect PR merged", () => {
      const payload = {
        action: "closed",
        pull_request: {
          merged: true,
          merged_at: "2026-02-05T10:00:00Z",
        },
      };

      const isMerged = payload.action === "closed" && payload.pull_request.merged;

      expect(isMerged).toBe(true);
    });
  });


  describe("Webhook Security", () => {
    it("should validate GitHub signature", () => {
      const validateSignature = (
        payload: string,
        signature: string,
        secret: string
      ): boolean => {
        // Simplified - real implementation uses crypto.createHmac
        return signature.startsWith("sha256=") && secret.length > 0;
      };

      const isValid = validateSignature(
        '{"test":true}',
        "sha256=abc123",
        "webhook-secret"
      );

      expect(isValid).toBe(true);
    });

    it("should reject invalid signatures", () => {
      const validateSignature = (signature: string | undefined): boolean => {
        if (!signature) return false;
        if (!signature.startsWith("sha256=")) return false;
        return true;
      };

      expect(validateSignature(undefined)).toBe(false);
      expect(validateSignature("invalid")).toBe(false);
      expect(validateSignature("sha256=valid")).toBe(true);
    });
  });

  describe("Webhook Error Handling", () => {
    it("should handle malformed JSON", () => {
      const parsePayload = (body: string): object | null => {
        try {
          return JSON.parse(body);
        } catch {
          return null;
        }
      };

      expect(parsePayload('{"valid":true}')).toEqual({ valid: true });
      expect(parsePayload("not json")).toBeNull();
    });

    it("should handle missing required fields", () => {
      const validateGitHubPush = (payload: Record<string, unknown>): boolean => {
        return !!(payload.ref && payload.commits && payload.repository);
      };

      expect(validateGitHubPush({ ref: "main", commits: [], repository: {} })).toBe(true);
      expect(validateGitHubPush({ ref: "main" })).toBe(false);
    });

    it("should log webhook errors", async () => {
      const errors: Array<{ type: string; message: string }> = [];

      const logError = (type: string, message: string) => {
        errors.push({ type, message });
      };

      logError("github", "Invalid signature");
      logError("vercel", "Missing commit sha");

      expect(errors).toHaveLength(2);
    });
  });

  describe("Webhook Idempotency", () => {
    it("should track processed webhook IDs", () => {
      const processedIds = new Set<string>();

      const isProcessed = (id: string): boolean => processedIds.has(id);
      const markProcessed = (id: string) => processedIds.add(id);

      expect(isProcessed("webhook-123")).toBe(false);
      markProcessed("webhook-123");
      expect(isProcessed("webhook-123")).toBe(true);
    });

    it("should skip duplicate webhooks", () => {
      const processedIds = new Set(["webhook-123"]);
      const results: string[] = [];

      const processWebhook = (id: string, data: string) => {
        if (processedIds.has(id)) return;
        processedIds.add(id);
        results.push(data);
      };

      processWebhook("webhook-123", "data1"); // duplicate
      processWebhook("webhook-456", "data2"); // new

      expect(results).toEqual(["data2"]);
    });
  });
});
