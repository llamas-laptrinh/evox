<!-- Mục đích: ứng phó sự cố production. -->
# Workflow: Incident Response

## Phân loại mức độ (severity)
- **SEV1**: sập/dừng dịch vụ, mất/lộ dữ liệu → xử lý ngay, báo động.
- **SEV2**: lỗi nặng nhưng còn workaround → xử lý trong giờ.
- **SEV3**: ảnh hưởng nhỏ → đưa vào backlog.

## Quy trình
1. **Giảm thiểu trước** — khôi phục dịch vụ là ưu tiên #1: rollback, tắt feature flag, scale, chặn nguồn lỗi. Chưa cần biết root cause.
2. **Chỉ định người điều phối** — 1 người chủ trì (incident commander); những người khác hỗ trợ.
3. **Cập nhật liên lạc** — thông báo bên liên quan; cập nhật định kỳ trạng thái cho tới khi xong.
4. **Ghi timeline** — mốc thời gian: phát hiện → hành động → kết quả. Ghi ngay khi đang xử lý.
5. **Xác nhận đã hồi phục** — theo dõi metric/log đủ lâu để chắc chắn ổn định.

## Sau sự cố
- **Postmortem không đổ lỗi**: chuyện gì xảy ra, vì sao, phát hiện thế nào, cách phòng tái diễn.
- Ghi bài học → `memory/lessons-learned.md`; bug gốc → `workflows/fix-bug.md` + `memory/common-bugs.md`.
- Tạo action item có người chịu trách nhiệm và hạn.
