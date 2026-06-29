<!-- Mục đích: yêu cầu của feature. Copy thư mục feature-a/ này cho mỗi feature mới. -->
# Local Task Entry — nhập task không cần Linear
- **Mục tiêu**: cho phép tạo task trực tiếp trong EVOX (thay Linear) để chạy hoàn toàn local; task hiện ngay trên dashboard.
- **User story**: Là *người vận hành*, tôi muốn *nhập task từ một trang trong app* để *điều phối agent mà không phụ thuộc Linear/SaaS*.
- **Acceptance criteria**:
  - [ ] Trang `/new-task` có form: title (bắt buộc), description, priority, assignee (tuỳ chọn).
  - [ ] Submit → gọi `api.tasks.create`, task xuất hiện trên `/dashboard` real-time (BR-005 dùng bảng `tasks`).
  - [ ] Title rỗng → chặn + báo lỗi; chưa seed project → báo "chạy seed:seedDatabase".
  - [ ] Thành công → toast + reset form; danh sách "Recent tasks" cập nhật.
  - [ ] UI chỉ dùng V2 tokens, không raw `_id` ngoài `key=` (BR-001).
- **Ngoài phạm vi**: sửa/xoá task trên trang này; sync 2 chiều với Linear; phân quyền người tạo (mặc định creator = `max`).
- **Business rules liên quan**: BR-001 (V2 tokens), BR-003 (agent string), BR-005 (bảng tasks), BR-002 (reuse trang sẵn có thay vì tạo trùng).
