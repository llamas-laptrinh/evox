<!-- Mục đích: thực thể nghiệp vụ và quan hệ. Load khi thiết kế data/model. -->
# Domain Model — EVOX

> Nguồn chuẩn: `convex/schema.ts` (~48 bảng). Dưới đây là các thực thể cốt lõi.

## Entities
- **Project** (`projects`): đơn vị gom task. `name`, `description`, `createdAt`. Mặc định "EVOX" khi seed.
- **Agent** (`agents`): thành viên AI. `name` (MAX/SAM/LEO/QUINN…), `role`, `status`, `avatar`, `soul`, `currentTask`, `lastSeen`, `statusReason`. Tên chuẩn (lowercase) là định danh — KHÔNG dùng `_id` để so sánh tên.
- **agentMappings** (`agentMappings`): map tên chuẩn (`"max"`) ↔ `convexAgentId`. Dùng cho attribution.
- **Task** (`tasks`): `projectId`, `title`, `description`, `status` (`backlog|todo|in_progress|review|done`), `priority` (`low|medium|high|urgent`), `assignee` (id agent), `createdBy`. Field Linear (`linearId`, `linearIdentifier`, `linearUrl`) đều OPTIONAL.
- **unifiedMessages** (`unifiedMessages`): bảng messaging DUY NHẤT cho code mới. Legacy `messages`/`agentMessages`/`meshMessages` = read-only.
- **activityEvents** (`activityEvents`): log sự kiện hợp nhất (có dedup 5 phút) — `agentName`, `category`, `eventType`, `title`, `taskId`, `timestamp`.
- **Notification** (`notifications`): `to`, `type`, `title`, `message`, `read`, `relatedTask`.
- **Heartbeat** (`heartbeats`): tín hiệu sống của agent (do cron sinh).
- **agentSkills** (`agentSkills`): kỹ năng + autonomy level + permissions + territory mỗi agent.
- **agentMemory** (`agentMemory`): bộ nhớ dài hạn của agent.

## Quan hệ
- Project **1—n** Task. Agent **1—n** Task (qua `assignee` và `createdBy`).
- Agent **1—1** agentMappings, **1—1** agentSkills, **1—n** agentMemory.
- Task **1—n** activityEvents / notifications.

## Quy ước dữ liệu
- Mọi document có `createdAt`/`updatedAt` (epoch ms từ `Date.now()`).
- Tạo bảng mới cần CEO duyệt (BR-006) — ưu tiên mở rộng bảng sẵn có.
- Attribution dùng `agentName` (string) của caller, không dùng key tích hợp ngoài.
