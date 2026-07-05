/**
 * POST /api/agent/create-ticket
 *
 * Allows agents (especially MAX) to create local tasks (Linear removed).
 *
 * Request body:
 * {
 *   "title": "Ticket title",
 *   "description": "Detailed description",
 *   "priority": "urgent" | "high" | "medium" | "low",
 *   "assignee": "sam" | "leo" | "max" | "quinn",   // optional, informational
 *   "from": "max" // Agent creating the ticket
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "ticket": { "id": "<taskId>", "title": "..." }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const VALID_PRIORITIES = ["urgent", "high", "medium", "low"] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function authenticateRequest(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get("x-api-key");
  const expected = process.env.EVOX_API_KEY;

  if (!expected) {
    return NextResponse.json(
      { success: false, error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!apiKey || apiKey !== expected) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // Authenticated
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  return new ConvexHttpClient(url);
}

export async function POST(request: NextRequest) {
  try {
    const authError = authenticateRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { title, description, priority, from } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 }
      );
    }

    const safePriority: Priority = VALID_PRIORITIES.includes(priority)
      ? priority
      : "medium";

    const convex = getConvexClient();

    // Resolve the default project (tasks require a projectId)
    const projects = await convex.query(api.projects.list, {});
    const projectId = projects?.[0]?._id;
    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No project found. Run `npx convex run seed:seedDatabase` to create the default project.",
        },
        { status: 500 }
      );
    }

    const taskId = await convex.mutation(api.tasks.create, {
      agentName: (from || "max").toLowerCase(),
      projectId,
      title,
      description: description || "",
      priority: safePriority,
    });

    return NextResponse.json({
      success: true,
      ticket: { id: taskId, title },
    });
  } catch (error) {
    console.error("[create-ticket] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/agent/create-ticket",
    description: "Create a local task via POST request (Linear removed)",
    usage: {
      method: "POST",
      body: {
        title: "string (required)",
        description: "string (optional)",
        priority: "urgent|high|medium|low (default: medium)",
        assignee: "sam|leo|max|quinn (optional, informational)",
        from: "agent name creating the ticket",
      },
    },
  });
}
