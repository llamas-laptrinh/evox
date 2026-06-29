<!-- Mục đích: thiết kế kỹ thuật của feature. -->
# Local Task Entry — Design
- **Tiếp cận**:
  - Trang client `app/new-task/page.tsx` ("use client") dùng `useMutation(api.tasks.create)` + `useQuery` cho `projects.list`, `agents.list`, `tasks.list`.
  - Lấy `projectId` từ `useProject()`, fallback `projects?.[0]?._id`. `agentName` creator = `"max"`. `assignee` optional = `Id<"agents">`.
  - Backend **không đổi**: dùng lại `tasks.create` sẵn có (BR-002 — không tạo mutation mới).
  - Tắt cron `sync-linear` trong `convex/crons.ts` để không lỗi khi thiếu `LINEAR_API_KEY`.
- **Thay đổi data model**: KHÔNG. Bảng `tasks` đã có; field Linear (`linearId`…) là optional nên task local bỏ trống được.
- **Đánh đổi**:
  - Hardcode creator = `max` (đơn giản) thay vì cho chọn — chấp nhận cho MVP.
  - Reuse `tasks.create` (có sẵn side-effect activity/notification) thay vì viết path riêng → ít code, nhất quán attribution.
- **Liên quan**: ADR-001 (Convex shared brain), ADR-003 (agent string). Skill: `skills/frontend/convex-client.md`, `skills/backend/convex-functions.md`. Hạ tầng local: `docs/SELF-HOSTED-LOCAL.md`.
