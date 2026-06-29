<!-- Mục đích: kiến trúc tổng thể + luồng dữ liệu. Load khi cần hiểu hệ thống, không phải mỗi task. -->
# Architecture — EVOX

## Nguyên tắc cốt lõi
**Convex là "shared brain".** Agent là *runtime-agnostic* (Claude Code, Cursor, daemon tương lai) — state bền vững sống trong Convex. Đổi runtime, giữ nguyên bộ nhớ.

## Sơ đồ tổng thể
```
   CEO (người) ── vision / duyệt / quyết định kiến trúc
        │
   EVOX (COO ảo) ── điều phối · bộ nhớ · giao tiếp
        │
  ┌─────┴───── agents: MAX(PM) · SAM(BE) · LEO(FE) · QUINN(QA) ─────┐
  │                                                                 │
  └────────────────────► CONVEX (shared brain, real-time) ◄─────────┘
                           │           │            │
                       Next.js UI   Crons        Webhooks
                    (useQuery/      (heartbeat,  (Linear/GitHub,
                     useMutation)    The Loop)    OPTIONAL)
```

## Luồng dữ liệu chính (ví dụ: tạo & theo dõi task)
1. **Tạo task**: UI (`/new-task`) hoặc Linear sync → mutation `tasks.create` ghi vào bảng `tasks`.
2. **Hiển thị real-time**: dashboard dùng `useQuery(api.tasks.list)` — Convex tự đẩy thay đổi, không polling.
3. **Điều phối**: MAX dispatch task cho agent theo territory; ghi `activityEvents` + `notifications`.
4. **Giám sát nền**: crons chạy heartbeat (agent còn sống?), The Loop (SLA breach → escalate), monitors.

## Ranh giới (boundaries)
- **Định danh agent** = string name (`"sam"`), KHÔNG so sánh với `v.id("agents")` — resolve qua `resolveAgentNameById()` trước. (BR-003)
- **Một bảng messaging**: code mới chỉ ghi `unifiedMessages`; `messages`/`agentMessages`/`meshMessages` là read-only legacy. (BR-005)
- **Single source of truth**: danh sách agent ở `convex/agentRegistry.ts`; status/SLA ở `convex/messageStatus.ts`. (BR-004)
- **Linear & Anthropic key là OPTIONAL** — bỏ được để chạy local thuần (xem `docs/SELF-HOSTED-LOCAL.md`).

## Liên kết
- Quyết định kiến trúc & vì sao → `decisions/` và `docs/decisions/` (ADR-001…006)
- Thực thể & quan hệ → `product/domain-model.md`
- Ràng buộc bắt buộc → `product/business-rules.md`
