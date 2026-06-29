<!-- Mục đích: tầm nhìn sản phẩm. Hiếm cần khi code — chỉ load khi bàn hướng đi. -->
# Product Vision — EVOX
- **Vấn đề giải quyết**: AI agent mất sạch context mỗi khi hết session. Làm sao để agent làm việc liên tục như một đồng đội thật, không phải bắt đầu lại từ đầu mỗi lần?
- **EVOX là gì**: COO cho đội kỹ sư AI. Không tự viết code — mà đảm bảo các agent biết phải làm gì, nhớ việc đã làm, và phối hợp không giẫm chân nhau.
- **Người dùng mục tiêu**: CEO/người vận hành đội agent (Claude Code, Cursor…) muốn agent tự chủ trong ranh giới cho phép, có giám sát của con người.
- **Giá trị cốt lõi (Five Truths)**:
  1. LLM không có bộ nhớ giữa các session → state phải sống ngoài model (Convex).
  2. Context window hữu hạn → bộ nhớ phân tầng (working / daily / long-term).
  3. Nhiều agent trên một codebase sẽ đụng nhau → cần lớp giao tiếp chung.
  4. Agent không tự "thức dậy" → cần scheduler/event (crons, heartbeat).
  5. Output AI không 100% tin cậy → cần phân tầng quyền (tự làm vs cần duyệt).
- **Không làm (out of scope)**: không khoá vào một AI runtime cụ thể (runtime-agnostic); không build lại task system riêng nếu Linear đáp ứng được; chỉ build khi một "truth" đòi hỏi.
- **Chỉ số thành công**: thời gian cold-start → productive (~30s), số ticket ship, agent phối hợp không xung đột, SLA của The Loop.
