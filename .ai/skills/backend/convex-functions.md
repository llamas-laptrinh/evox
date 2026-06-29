<!-- Mục đích: viết query/mutation Convex. Load khi task backend đụng dữ liệu. -->
# Skill: Convex Functions (query / mutation)

## Khi nào dùng
Đọc/ghi dữ liệu trong `convex/*.ts` bằng `query` (đọc, reactive) hoặc `mutation` (ghi, transactional).

## Quy tắc / pattern
- **Khai báo `args` bằng `v.*`** (validator) cho mọi function — Convex validate ở biên. Trả dữ liệu tối thiểu client cần.
- **Attribution qua tên agent (string)**: nhận `agentName` rồi `resolveAgentIdByName()` — KHÔNG nhận `v.id("agents")` rồi so với tên (BR-003).
- **Index thay vì full scan**: query lớn dùng `.withIndex("by_x", q => q.eq(...))`, không `.filter()` trên toàn bảng.
- **Một bảng messaging**: ghi vào `unifiedMessages`; `messages`/`agentMessages`/`meshMessages` read-only (BR-005).
- **Single source of truth**: agent list từ `agentRegistry.ts`, status/SLA từ `messageStatus.ts` — không hardcode (BR-004).
- **Không throw khi layout phụ thuộc**: query mà UI luôn cần (vd `projects.list`) bọc `try/catch` trả `[]` thay vì ném.
- **Timestamp**: `Date.now()` (epoch ms); set cả `createdAt` lẫn `updatedAt`.
- **Side-effect kèm theo**: tạo task → ghi luôn `activities` + `activityEvents` (có dedup) + `notifications` nếu có assignee. Xem `convex/tasks.ts:create`.
- **File ≤ 500 dòng** (BR-009) — vượt thì tách theo domain.

## Cạm bẫy thường gặp
- So `agent._id` với `"sam"` → luôn sai; phải resolve tên trước.
- Quên `projectId`/agent chưa seed → `tasks.create` lỗi. Chạy `seed:seedDatabase` trước.
- `.filter()` thay vì `.withIndex()` trên bảng lớn → chậm, tốn bandwidth.

## Tham chiếu
- `product/domain-model.md` · `product/business-rules.md` · ví dụ: `examples/api-example.md`, `examples/coding-example.md`
- Gọi API ngoài / dài → `skills/backend/convex-actions.md` · Job nền → `skills/backend/convex-crons.md`
