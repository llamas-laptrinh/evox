<!-- Mục đích: job nền định kỳ (Convex crons). Load khi thêm/sửa việc chạy theo lịch. -->
# Skill: Convex Crons

## Khi nào dùng
Thêm/sửa job nền chạy theo lịch trong `convex/crons.ts` — heartbeat, monitor, The Loop SLA, cleanup.

## Quy tắc / pattern
- **Khai báo trong `convex/crons.ts`**: `crons.interval(...)` hoặc `crons.cron("0 * * * *", ...)`, gọi `internal.<file>.<fn>`.
- **Stagger để tránh write-conflict**: các job đừng cùng chạy một thời điểm (vd sync 5m, stuck-agents 7m, recovery 6m, SLA 8m). Lệch phút nhau.
- **Tắt job phụ thuộc tích hợp ngoài khi chạy local**: `sync-linear` phải comment lại nếu không có `LINEAR_API_KEY` (BR — edge case), nếu không sẽ lỗi mỗi 5 phút.
- **Idempotent + nhẹ**: cron có thể chạy lệch/lặp; mỗi lần phải an toàn và nhanh.
- **Mọi job gọi `internal.*`** (không public) để không lộ ra client.

## Cạm bẫy thường gặp
- Bật `sync-linear` mà thiếu key → spam lỗi log.
- Nhiều cron ghi cùng bảng cùng lúc → write conflict; phải stagger.
- Job nặng/đồng bộ dài → chồng lấn lần chạy kế tiếp.

## Tham chiếu
- `convex/crons.ts` · `convex/heartbeat.ts` · `loopMonitor`/`loopMetrics`
- Gọi API ngoài trong job → `skills/backend/convex-actions.md`
