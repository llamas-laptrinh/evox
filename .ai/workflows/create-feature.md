<!-- Mục đích: quy trình tạo feature mới (đóng luôn vai trò developer/architect). -->
# Workflow: Create Feature

## Sinh spec từ mô tả (AI điền)
> Khi người dùng nói kiểu *"sinh spec cho tính năng <X>: <mô tả>"* — agent tự viết spec, KHÔNG bắt người dùng điền tay.

1. **Tạo khung** — chạy `@dtd-dev/agent-kb feature <slug>` (hoặc tạo `specs/<slug>/` từ khung trống). Slug ngắn gọn theo tên feature.
2. **Đọc context trước khi viết** — `product/business-rules.md`, `product/domain-model.md`, `core/glossary.md`, `core/coding-standards.md` để spec khớp nghiệp vụ & quy ước sẵn có.
3. **Điền 4 file** từ mô tả người dùng:
   - `requirements.md`: mục tiêu, user story, acceptance criteria, ngoài phạm vi, BR liên quan.
   - `design.md`: tiếp cận, thay đổi data model, đánh đổi.
   - `api.md`: endpoint, request/response, mã lỗi (bỏ nếu feature không có API).
   - `test-cases.md`: happy path + edge case + ca theo từng BR.
4. **Quy tắc khi sinh**:
   - Yêu cầu mơ hồ → **HỎI, không bịa** acceptance criteria/BR.
   - Tham chiếu BR sẵn có theo mã (vd BR-001); **không tự đẻ rule mới** — thiếu rule thì đề xuất rồi hỏi.
   - Giữ nhất quán với `domain-model.md` (tên entity) và `glossary.md` (thuật ngữ).
   - Điền xong **xoá dòng `<!-- AI: ... -->`** trong mỗi file.
5. **Dừng cho người dùng DUYỆT spec** rồi mới sang phần "Quy trình" code/test bên dưới (spec-first).

## Quy trình
1. **Hiểu yêu cầu** — đọc `specs/<feature>/requirements.md`. Chưa có thư mục spec thì tạo nhanh bằng `@dtd-dev/agent-kb feature <tên>`, rồi viết trước (mục tiêu, user story, acceptance criteria, ngoài phạm vi, BR liên quan).
2. **Thiết kế** — `specs/<feature>/design.md`: tiếp cận, thay đổi data model, đánh đổi. Quyết định lớn → thêm ADR vào `decisions/`.
3. **Chốt API** — nếu có endpoint, ghi hợp đồng vào `specs/<feature>/api.md` trước khi code.
4. **Code** — theo `core/coding-standards.md` + skill liên quan (`skills/backend|frontend/*`). Commit nhỏ, từng phần chạy được.
5. **Test** — viết theo `specs/<feature>/test-cases.md`; phủ happy path + edge case + business rule.
6. **Tự review** — chạy `workflows/code-review.md` trước khi mở PR.

## Definition of Done
- [ ] Đủ acceptance criteria; không vỡ tính năng cũ.
- [ ] Test xanh, có cho cả ca lỗi.
- [ ] Đã cập nhật doc liên quan (spec/ADR/glossary).
- [ ] Không secret/log debug sót; đã tự review.

## Lưu ý
- Mơ hồ yêu cầu thì hỏi, đừng đoán.
- Phạm vi phình to → tách feature nhỏ hơn.
