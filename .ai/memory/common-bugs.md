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
