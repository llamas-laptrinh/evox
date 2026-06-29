<!-- Mục đích: vòng tự học — chốt bài học sau mỗi task/incident vào memory/. Load khi cần ghi lại kinh nghiệm. -->
# Workflow: Learn (tự học)

> Sau mỗi bug khó, incident, hoặc khi người dùng sửa cách làm — agent **chủ động ghi lại** để lần sau không lặp. Đây là thứ biến `memory/` thành vòng lặp sống thay vì file chết.

## Khi nào chạy
- Vừa fix xong một bug đáng nhớ (root cause không hiển nhiên).
- Sau postmortem một incident.
- Người dùng chỉnh cách làm: *"lần sau làm X thay vì Y"*, *"đừng bao giờ Z"*.

## Ghi vào đâu
| Loại | File |
|---|---|
| Bài học chung (cách làm) | `memory/lessons-learned.md` — *chuyện gì → học được gì → đổi cách làm thế nào* |
| Bug hay tái diễn | `memory/common-bugs.md` — *triệu chứng → nguyên nhân gốc → cách xử* |
| Quy trình gỡ rối theo tình huống | `memory/troubleshooting.md` |
| Quyết định kiến trúc | tạo ADR: `@dtd-dev/agent-kb adr <tiêu đề>` |

## Quy tắc
- Mục **ngắn gọn, có ngày** (YYYY-MM-DD). Append, không sửa lịch sử.
- Chỉ ghi cái **khái quát hoá được** (có thể lặp ở task khác) — không ghi chi tiết vụn dùng một lần.
- Trùng mục cũ → **cập nhật** mục đó, đừng tạo bản sao.
- **Không ghi** secret/PII/dữ liệu nhạy cảm.
- Mơ hồ "có đáng ghi không" → hỏi người dùng một câu, đừng tự phình memory.
