<!-- Mục đích: 1 quyết định kiến trúc. Copy file này cho ADR mới. -->
# ADR-001: Convex là "shared brain", agent runtime-agnostic
- **Trạng thái**: Accepted
- **Bối cảnh**: LLM không có bộ nhớ giữa các session (Truth 1). Đội nhiều agent chạy trên các runtime khác nhau (Claude Code, Cursor) cần một nguồn state chung, real-time để boot lên là làm việc tiếp được.
- **Quyết định**: Dùng **Convex** làm nơi lưu toàn bộ state (agents, tasks, messages, memory). Agent là *runtime-agnostic* — đổi runtime vẫn giữ nguyên bộ nhớ. UI đọc reactive qua `useQuery`/`useMutation`, không polling.
- **Phương án loại bỏ**: Supabase/Firebase (phải tự dựng realtime/WebSocket); DB tự host + tự xây sync layer (tốn công, dễ sai). 
- **Hệ quả**: Phụ thuộc Convex (giảm rủi ro bằng self-host Docker — `docs/SELF-HOSTED-LOCAL.md`); ~48 bảng nên cần kỷ luật schema (BR-006). Canonical ADR đầy đủ: `docs/decisions/`.
