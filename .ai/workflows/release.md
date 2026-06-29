<!-- Mục đích: quy trình release. -->
# Workflow: Release

## Trước khi release (gate)
- [ ] Toàn bộ test xanh trên CI; không lỗi lint/build.
- [ ] Đã review & merge xong; nhánh release cập nhật từ main.
- [ ] Migration DB (nếu có) đã kiểm thử và có kế hoạch rollback.
- [ ] Biến môi trường / secret cho version mới đã sẵn sàng.

## Phát hành
1. **Version** — bump theo SemVer: MAJOR (phá vỡ tương thích) / MINOR (thêm tính năng) / PATCH (sửa lỗi).
2. **Changelog** — ghi thay đổi theo nhóm Added / Changed / Fixed / Removed.
3. **Tag** — gắn tag version, tạo release note.
4. **Deploy** — merge `main` → Vercel auto-deploy; nếu đổi Convex schema/functions thì `npx convex deploy`. Chi tiết: `skills/devops/deployment.md`.

## Sau release
- [ ] Smoke test các luồng chính trên production.
- [ ] Theo dõi metric/log/error rate trong khoảng đầu sau deploy.
- [ ] Có sự cố → `workflows/incident-response.md` (rollback nếu cần).

## Nguyên tắc
- Release nhỏ, thường xuyên hơn là gom lớn.
- Tránh deploy sát giờ nghỉ / cuối tuần khi không có người trực.
