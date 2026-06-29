<!-- Mục đích: test case của feature. -->
# Local Task Entry — Test Cases
| ID | Tình huống | Input | Kỳ vọng |
|----|-----------|-------|---------|
| TC-1 | Happy path | title + description + priority, đã seed | Task tạo thành công; toast; form reset; hiện trong Recent tasks + dashboard |
| TC-2 | Title rỗng | title="" | Chặn submit, toast "Missing title", không gọi mutation |
| TC-3 | Chưa seed project | không có project nào | Toast hướng dẫn chạy `seed:seedDatabase`, không gọi mutation |
| TC-4 | Có assignee | chọn agent trong dropdown | Task có `assignee`; agent nhận `notifications` |
| TC-5 | Không assignee | để "Unassigned" | Task tạo với `assignee` = undefined, không lỗi |
| TC-6 | Real-time | mở `/dashboard` ở tab khác rồi tạo task | Task xuất hiện ngay không cần refresh (Convex reactive) |
| TC-7 | V2 tokens | rà class trên trang | Không có `zinc-*`/`gray-*`; không raw `_id` ngoài `key=` (BR-001) |
