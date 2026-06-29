<!-- Mục đích: bug hay tái diễn + cách xử nhanh. Append theo bug thật. -->
# Common Bugs — EVOX
| Triệu chứng | Nguyên nhân gốc | Cách xử |
|---|---|---|
| So sánh agent luôn sai / không match | So `agent._id` với tên string (`"sam"`) | Resolve qua `resolveAgentNameById()`/`resolveAgentIdByName()` trước (BR-003) |
| `tasks.create` lỗi "validator"/không có project | DB chưa seed (thiếu `projects`/`agents`) | `npx convex run seed:seedDatabase` (+ `seedQuinn`) |
| Log spam lỗi mỗi 5 phút khi chạy local | Cron `sync-linear` chạy mà thiếu `LINEAR_API_KEY` | Comment job `sync-linear` trong `convex/crons.ts` |
| Màu UI bị "lệch tông"/cấm bởi review | Dùng raw `zinc-*`/`gray-*` thay vì token V2 | Đổi sang `bg-base`/`bg-surface-1`/`text-secondary`… (BR-001) |
| Component crash "cannot read map of undefined" | Render `useQuery` data khi còn `undefined` (loading) | Check `data === undefined` → render loading trước |
| Dữ liệu message thiếu/lệch | Ghi vào bảng legacy (`messages`/`agentMessages`) | Code mới chỉ ghi `unifiedMessages` (BR-005) |
| Write conflict trong Convex cron | Nhiều cron ghi cùng bảng cùng thời điểm | Stagger lịch (sync 5m, stuck 7m, recovery 6m, SLA 8m) |
| Hardcoded secret lọt vào commit | Để key trong code/script làm fallback | Chỉ `.env.local`; grep secret trước commit (xem `lessons-learned`) |
| `ArgumentValidationError: extra field` ở Convex action/mutation | Khai báo `args: {}` (rỗng) nhưng handler đọc field từ args; TS không bắt được vì kiểu chỉ ở handler | Khai báo validator đúng (`args: { x: v.string() }` / `v.any()`); validator phải khớp dữ liệu caller truyền. Vd `convex/maxMonitor.ts` |
| App "Something went wrong" mọi trang khi chạy self-hosted | CSP `connect-src` chỉ cho `*.convex.cloud` → chặn `ws://127.0.0.1:3210` của backend local | Thêm origin backend vào `connect-src` trong `next.config.ts` (suy từ `NEXT_PUBLIC_CONVEX_URL`, cả http+ws); restart `npm run dev` |
