<!-- Mục đích: viết Convex action (gọi API ngoài / việc không thuần). Load khi task cần I/O ngoài. -->
# Skill: Convex Actions

## Khi nào dùng
Khi cần **gọi API bên ngoài** (Linear, GitHub, Anthropic) hoặc làm việc không-deterministic — `query`/`mutation` KHÔNG được phép làm việc này. Xem `docs/patterns/CONVEX-ACTIONS.md`.

## Quy tắc / pattern
- **Action không truy cập DB trực tiếp**: đọc/ghi dữ liệu qua `ctx.runQuery`/`ctx.runMutation`, không `ctx.db` trong action.
- **Secret từ env**, không hardcode (BR-010): `process.env.LINEAR_API_KEY`, `ANTHROPIC_API_KEY`. Cả hai là OPTIONAL — phải handle khi thiếu (skip thay vì crash).
- **Idempotent với nguồn ngoài**: webhook/sync gọi lặp phải an toàn (khớp theo id ngoài như `linearId`).
- **Tách I/O khỏi logic**: action lo gọi mạng + map dữ liệu; ghi DB dồn vào một mutation để transactional.
- **Lỗi mạng có ngữ cảnh**: log đủ để debug, không nuốt im lặng; không log token/PII.

## Cạm bẫy thường gặp
- Dùng `ctx.db` trong action → không tồn tại; phải qua `runQuery`/`runMutation`.
- Giả định `LINEAR_API_KEY` luôn có → crash ở chế độ local. Check trước.
- Gọi API ngoài trong vòng lặp không giới hạn → rate-limit/tốn chi phí.

## Tham chiếu
- `docs/patterns/CONVEX-ACTIONS.md` · `convex/linearSync.ts` (ví dụ sync) · `core/tech-stack.md`
- Lịch chạy định kỳ → `skills/backend/convex-crons.md`
