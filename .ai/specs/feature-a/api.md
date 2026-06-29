<!-- Mục đích: hợp đồng API của feature. -->
# Local Task Entry — API

Feature dùng lại các Convex function sẵn có (không thêm endpoint mới).

## `mutation api.tasks.create` (đã có)
Hợp đồng đầy đủ: xem `examples/api-example.md`.
- **Args chính**: `agentName: "max"`, `projectId`, `title`, `description`, `priority`, `assignee?`.
- **Trả về**: `Id<"tasks">`.
- **Lỗi**: `agentName` chưa seed → resolve fail; `projectId` thiếu → chạy `seed:seedDatabase`.

## `query api.tasks.list` (đã có)
- **Args**: `{ projectId?: Id<"projects">, limit?: number }` (mặc định 500).
- **Dùng ở trang**: `useQuery(api.tasks.list, { limit: 8 })` cho phần "Recent tasks".

## `query api.projects.list` / `api.agents.list` (đã có)
- `projects.list`: lấy `projectId` mặc định.
- `agents.list`: đổ dropdown assignee (`_id` + `name` + `avatar`).
