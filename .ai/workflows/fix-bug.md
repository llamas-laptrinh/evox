<!-- Mục đích: quy trình fix bug. -->
# Workflow: Fix Bug

## Quy trình
1. **Tái hiện** — dựng lại bug một cách ổn định; ghi rõ bước tái hiện + môi trường + kết quả mong đợi vs thực tế.
2. **Tra cứu** — check `memory/common-bugs.md` và `memory/troubleshooting.md` xem đã gặp chưa.
3. **Khoanh vùng** — thu hẹp dần (log, bisect, test nhỏ) tới nơi gây lỗi.
4. **Root cause** — tìm nguyên nhân gốc, không vá triệu chứng. Hỏi "vì sao" tới khi tới gốc.
5. **Test bắt bug** — viết test fail trước, tái hiện đúng bug, rồi mới sửa cho test xanh (regression test).
6. **Sửa** — đổi nhỏ nhất đủ giải quyết gốc; rà các nơi khác cùng pattern.
7. **Xác minh** — chạy lại bước tái hiện + toàn bộ test liên quan.
8. **Ghi lại** — nếu đáng nhớ, thêm vào `memory/common-bugs.md` (triệu chứng → nguyên nhân → cách xử).

## Lưu ý
- Bug production gấp → ưu tiên giảm thiểu trước theo `workflows/incident-response.md`, sửa gốc sau.
- Không xoá test/giảm assertion để "qua bài".
