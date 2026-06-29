<!-- Mục đích: minh hoạ chuẩn code (load khi cần "mẫu để bắt chước"). -->
# Coding Example — Convex mutation (TypeScript)

> Minh hoạ `core/coding-standards.md` + `skills/backend/convex-functions.md`:
> validate ở biên · attribution qua tên agent (BR-003) · side-effect tách bạch · timestamp nhất quán.

```ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { resolveAgentIdByName } from "./agentMappings";

export const create = mutation({
  args: {
    agentName: v.string(),                 // string name, KHÔNG v.id (BR-003)
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"), v.literal("medium"),
      v.literal("high"), v.literal("urgent"),
    ),
    assignee: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    // Resolve tên → id ở biên; tin tưởng dữ liệu bên trong.
    const createdBy = await resolveAgentIdByName(ctx.db, args.agentName);
    const now = Date.now();                 // timestamp nhất quán, set cả created/updated

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: "backlog",
      priority: args.priority,
      createdBy,
      assignee: args.assignee,
      createdAt: now,
      updatedAt: now,
    });

    // Side-effect (activity log) tách khỏi logic chính.
    await ctx.db.insert("activityEvents", {
      agentId: createdBy,
      agentName: args.agentName.toLowerCase(),
      category: "task",
      eventType: "created",
      title: `${args.agentName.toUpperCase()} created task`,
      description: args.title,
      taskId,
      projectId: args.projectId,
      timestamp: now,
    });

    return taskId;                          // trả dữ liệu tối thiểu
  },
});
```

Nguồn thật: `convex/tasks.ts`.
