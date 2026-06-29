<!-- Mục đích: mẫu hợp đồng Convex function của dự án. -->
# API Example — Convex function

> EVOX không dùng REST cho data; client gọi Convex `query`/`mutation` qua `useQuery`/`useMutation`. Dưới đây là "hợp đồng" của một mutation thật.

## `mutation api.tasks.create`
Tạo một task (thay cho Linear ở chế độ local).

**Args** (validate bằng `v.*`)
```ts
{
  agentName: v.string(),            // người tạo, vd "max" — KHÔNG phải _id (BR-003)
  projectId: v.id("projects"),      // cần seed trước (seed:seedDatabase)
  title: v.string(),
  description: v.string(),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  assignee: v.optional(v.id("agents")),
}
```

**Trả về**: `Id<"tasks">` (id của task vừa tạo).

**Side-effects**: ghi `activities` + `activityEvents` (dedup 5'), và `notifications` nếu có `assignee`.

**Lỗi** (ném từ handler — client bắt qua try/catch):
| Tình huống | Nguyên nhân |
|---|---|
| `agentName` không resolve được | tên không có trong `agentRegistry`/`agentMappings` (chưa seed) |
| `projectId` không hợp lệ | chưa seed project — chạy `npx convex run seed:seedDatabase` |

**Client gọi**:
```ts
const create = useMutation(api.tasks.create);
await create({ agentName: "max", projectId, title, description, priority: "medium" });
```

**Convention**: args luôn có validator `v.*`; attribution qua `agentName`; trả dữ liệu tối thiểu. Đọc reactive bằng `useQuery(api.tasks.list, { limit })`.
