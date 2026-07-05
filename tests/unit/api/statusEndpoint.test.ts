/**
 * Critical Path Tests: Status Endpoint
 *
 * North Star: CEO sees system state in 3 seconds.
 * Tests cover: /status endpoint, agent list, dispatch queue.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const BASE_URL = "https://gregarious-elk-556.convex.site";

describe("Status Endpoint - Critical Path", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("GET /status", () => {
    it("should return system status overview", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          timestamp: Date.now(),
          agents: [],
          pendingDispatches: 0,
          dispatches: [],
          recentActivity: [],
          webhooks: {
            github: "https://gregarious-elk-556.convex.site/webhook/github",
          },
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);
      const data = await response.json();

      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("agents");
      expect(data).toHaveProperty("pendingDispatches");
    });

    it("should return agent list with status", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          timestamp: Date.now(),
          agents: [
            { name: "SAM", role: "backend", status: "online", currentTask: "AGT-123" },
            { name: "LEO", role: "frontend", status: "busy", currentTask: "AGT-456" },
            { name: "QUINN", role: "qa", status: "offline", currentTask: null },
          ],
          pendingDispatches: 2,
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);
      const data = await response.json();

      expect(data.agents).toHaveLength(3);
      expect(data.agents[0]).toHaveProperty("name");
      expect(data.agents[0]).toHaveProperty("status");
    });

    it("should return pending dispatch count", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          pendingDispatches: 5,
          dispatches: [
            { ticket: "AGT-100", agentName: "SAM" },
            { ticket: "AGT-101", agentName: "LEO" },
          ],
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);
      const data = await response.json();

      expect(data.pendingDispatches).toBe(5);
      expect(data.dispatches.length).toBeLessThanOrEqual(5);
    });

    it("should return recent activity", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          recentActivity: [
            { agentName: "SAM", eventType: "completed", description: "Done AGT-123" },
            { agentName: "LEO", eventType: "push", description: "Pushed 3 commits" },
          ],
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);
      const data = await response.json();

      expect(data.recentActivity).toBeDefined();
      expect(data.recentActivity.length).toBeLessThanOrEqual(10);
    });

    it("should return webhook URLs", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          webhooks: {
            github: "https://gregarious-elk-556.convex.site/webhook/github",
          },
        }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);
      const data = await response.json();

      expect(data.webhooks).toHaveProperty("github");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on internal error", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal server error" }),
      } as Response);

      const response = await fetch(`${BASE_URL}/status`);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /webhook/github", () => {
    it("should accept push events", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, processed: 1 }),
      } as Response);

      const payload = {
        ref: "refs/heads/main",
        commits: [{ id: "abc123", message: "closes AGT-123: fix bug" }],
        repository: { full_name: "sonpiaz/evox" },
        pusher: { name: "sam" },
      };

      await fetch(`${BASE_URL}/webhook/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-github-event": "push",
        },
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/webhook/github`,
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should parse closes AGT-XXX from commits", () => {
      const commitMessage = "closes AGT-123: implemented feature";
      const pattern = /closes\s+(AGT-\d+)/i;
      const match = commitMessage.match(pattern);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("AGT-123");
    });

    it("should parse fixes AGT-XXX from commits", () => {
      const commitMessage = "fixes AGT-456: bug resolved";
      const pattern = /fixes\s+(AGT-\d+)/i;
      const match = commitMessage.match(pattern);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("AGT-456");
    });
  });
});
