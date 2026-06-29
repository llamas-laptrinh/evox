<!-- Mục đích: thuật ngữ kỹ thuật + nghiệp vụ (đã gộp glossary & terminology). 1 dòng/khái niệm. -->
# Glossary — EVOX

> Gộp thuật ngữ kỹ thuật và nghiệp vụ vào một nơi để tránh trùng lặp.

| Thuật ngữ | Nghĩa |
|---|---|
| EVOX | Hệ thống "Mission Control" + COO ảo điều phối đội agent AI. |
| Agent | Một thành viên AI. Tên chuẩn (string): `max` (PM), `sam` (backend), `leo` (frontend), `quinn` (QA), `evox`, `nova`. Nguồn: `convex/agentRegistry.ts`. |
| Territory | Vùng file mỗi agent phụ trách (vd Sam: `convex/`, Leo: `app/`+`components/`). |
| Shared brain | Convex — nơi lưu toàn bộ state để agent đọc khi boot (runtime-agnostic). |
| Soul / Working memory | Bộ nhớ agent: định danh (SOUL) + việc đang làm (WORKING) + daily notes. |
| Heartbeat | Tín hiệu sống của agent (cron `convex/heartbeat.ts`) để theo dõi health. |
| The Loop | Cơ chế giám sát SLA + auto-escalate (`loopMonitor`, `loopMetrics`). |
| unifiedMessages | Bảng messaging DUY NHẤT cho code mới (xem BR-005). |
| activityEvents | Log sự kiện hợp nhất (có dedup) hiển thị trên dashboard. |
| Display ID | Mã ticket hiển thị dạng `AGT-XXX` (từ Linear `linearIdentifier`). |
| Dispatch | Hành động giao task cho agent (qua `/dispatch` hoặc dashboard). |
| Project | Đơn vị gom task (`projects`), mặc định "EVOX" khi seed. |
| Convex cron | Job nền định kỳ trong `convex/crons.ts` (heartbeat, monitor, SLA…). |

**Quy ước:** thêm từ mới vào đây thay vì giải thích lại trong nhiều file.
