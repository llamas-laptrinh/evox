<!-- Mục đích: ràng buộc nghiệp vụ + kiến trúc. Load khi code. -->
# Business / Architecture Rules — EVOX

> Mỗi rule đánh số để code/test/review tham chiếu. Nguồn chuẩn: `CLAUDE.md`.

- **BR-001 — V2 tokens, không raw color**: UI chỉ dùng semantic token (`bg-base`, `bg-surface-1`, `border-border-default`, `text-secondary`…). Cấm `zinc-*`/`gray-*`/`slate-*`. Ref: `docs/EVOX-DESIGN-SYSTEM.md`.
- **BR-002 — Search trước khi tạo file**: trước khi tạo file mới phải grep file tương tự; có → EDIT, không tạo trùng.
- **BR-003 — Định danh agent = string**: dùng tên chuẩn (`"sam"`); KHÔNG so `v.id("agents")` với tên — resolve qua `resolveAgentNameById()` trước.
- **BR-004 — Single source of truth**: danh sách agent ở `convex/agentRegistry.ts`; status/SLA/label ở `convex/messageStatus.ts`. Không hardcode `["sam","leo",...]`.
- **BR-005 — Một bảng messaging**: code mới ghi `unifiedMessages`. `messages`/`agentMessages`/`meshMessages` read-only.
- **BR-006 — Không tạo bảng schema mới khi chưa CEO duyệt**: ưu tiên mở rộng bảng sẵn có (~48 bảng).
- **BR-007 — Proof of work**: ticket "Done" cần commit hash + files changed + build pass. Không commit = chưa done.
- **BR-008 — Xoá dead code**: thay thế = xoá file cũ + gỡ import + verify build. Không để "phòng khi".
- **BR-009 — Max file size**: component ≤ 300 dòng, file Convex ≤ 500 dòng. Vượt → tách.
- **BR-010 — Bảo mật**: không hardcode secret (API key/token) — chỉ `.env.local`; grep secret trước mỗi commit.

## Edge cases
- Chạy local không có `LINEAR_API_KEY` → cron `sync-linear` phải tắt (commented) để không lỗi; task tạo qua `/new-task`.
- Task tạo local không có `linearId` → bình thường (mọi field Linear là optional).
- Cross-territory edit được phép nhưng phải report ở #dev.
