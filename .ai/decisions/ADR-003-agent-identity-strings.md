<!-- Mục đích: 1 quyết định kiến trúc. Copy file này cho ADR mới. -->
# ADR-003: Định danh agent bằng tên string, không phải Convex ID
- **Trạng thái**: Accepted
- **Bối cảnh**: `v.id("agents")` không ổn định qua migration và gây lỗi so sánh case-sensitive (EVOX ≠ evox). Attribution (ai làm gì) cần một định danh bền vững, người-đọc-được.
- **Quyết định**: Định danh chuẩn là **tên lowercase**: `"max"`, `"sam"`, `"leo"`, `"quinn"`, `"evox"`, `"nova"` (nguồn: `convex/agentRegistry.ts`). Cần Convex ID thì **resolve qua `resolveAgentNameById()` / `resolveAgentIdByName()`**, không so trực tiếp ID với tên. (BR-003)
- **Phương án loại bỏ**: So `_id` trực tiếp (vỡ khi seed lại / migrate); dùng tên hiển thị hoa-thường tuỳ tiện (lỗi case).
- **Hệ quả**: Mọi API attribution nhận `agentName` (string); có lớp map `agentMappings` + helper resolve. ID stable thêm ở `agentRegistry` (vd `agt_sam_002`).
