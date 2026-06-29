<!-- Mục đích: bài học tích luỹ. Append dần, đừng viết trước. -->
# Lessons Learned — EVOX
> Mỗi mục: chuyện gì xảy ra → học được gì → đổi cách làm thế nào. Nguồn đầy đủ: `docs/LESSONS.md`.

- 2026-02-05 — **Không hardcode secret**: `agent-boot.sh` từng để `LINEAR_API_KEY` hardcoded làm fallback → mọi secret phải ở `.env.local`, thêm grep secret vào pre-commit (BR-010).
- 2026-02-05 — **Verify sau khi giao việc**: báo "đã giao task" nhưng agent không chạy (thiếu Enter trong tmux) → gửi task xong phải đợi & verify agent đang chạy mới báo done.
- 2026-02-05 — **File context riêng từng agent**: dùng chung `boot-prompt.md` khiến agent này nhận identity của agent khác → mỗi agent một file `boot-prompt-{agent}.md`.
- 2026-02 — **Đừng tạo file mới khi đã có**: từng có 7 biến thể dashboard do agent tạo thay vì sửa → search trước, EDIT thay vì tạo trùng (BR-002).
