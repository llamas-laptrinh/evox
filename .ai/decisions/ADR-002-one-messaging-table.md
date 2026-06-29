<!-- Mục đích: 1 quyết định kiến trúc. Copy file này cho ADR mới. -->
# ADR-002: Một bảng messaging duy nhất (unifiedMessages)
- **Trạng thái**: Accepted
- **Bối cảnh**: Lịch sử để lại 3 bảng tin nhắn (`messages`, `agentMessages`, `meshMessages`) → code phân tán, khó truy vấn, dễ ghi nhầm bảng.
- **Quyết định**: Mọi code mới chỉ ghi vào **`unifiedMessages`**. 3 bảng cũ chuyển **read-only** (giữ để không vỡ dữ liệu lịch sử), không thêm ghi mới. (BR-005)
- **Phương án loại bỏ**: Migrate gộp ngay toàn bộ dữ liệu cũ (rủi ro, tốn công, chưa cần); giữ nguyên đa bảng (tiếp tục phân mảnh).
- **Hệ quả**: Đọc dữ liệu cũ phải biết bảng legacy; có thể cần migration dần về sau. Status/SLA của message lấy từ `messageStatus.ts` (BR-004).
