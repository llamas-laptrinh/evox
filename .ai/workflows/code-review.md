<!-- Mục đích: checklist review (đóng vai reviewer). -->
# Workflow: Code Review

> Review theo ưu tiên: chặn (P0) trước, góp ý (P2) sau. Bám `core/coding-standards.md`.

## P0 — Phải sửa trước khi merge
- [ ] **Đúng yêu cầu**: khớp acceptance criteria trong `specs/<feature>/`.
- [ ] **Correctness**: logic đúng; xử lý edge case (null/rỗng/biên/loading `undefined`).
- [ ] **Bảo mật**: không hardcode secret (BR-010); validate input (`v.*` ở Convex); phân quyền đúng.
- [ ] **EVOX gates**: không raw `zinc-*`/`gray-*` (BR-001); không raw `_id` trong UI ngoài `key=`; agent identity dùng string + resolve (BR-003); code mới ghi `unifiedMessages` (BR-005).
- [ ] **Proof of Work (BR-007)**: `npx next build` pass; commit hash + files changed.
- [ ] **Test**: logic mới có test; test xanh; có cả happy path lẫn ca thất bại.

## P1 — Nên sửa
- [ ] **Error handling**: không nuốt lỗi; tách lỗi nghiệp vụ vs hệ thống; log có ngữ cảnh.
- [ ] **Dữ liệu/đồng thời**: race condition, transaction, idempotency (nếu liên quan).
- [ ] **Hiệu năng**: không N+1 query, không load thừa, không vòng lặp tốn kém.
- [ ] **Tương thích**: không phá API/contract cũ; có migration nếu đổi schema.

## P2 — Chất lượng
- [ ] Tên rõ nghĩa, hàm đủ nhỏ, không lặp code, không magic value.
- [ ] Không code chết / import thừa / log debug sót lại.
- [ ] Comment giải thích "vì sao", không lặp "cái gì".

## Cách góp ý
- Ghi rõ mức (P0/P1/P2) + lý do; gợi ý cách sửa, không chỉ chê.
- Tách "bắt buộc" và "tuỳ chọn (nit)". Khen điểm tốt khi xứng đáng.
