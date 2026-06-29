<!-- Mục đích: convention React trong dự án. Load khi task thuộc loại này. -->
# Skill: React

## Khi nào dùng
Viết/sửa component, hook, quản lý state, fetch dữ liệu phía React.

## Quy tắc / pattern
- **Function component + hooks**; không dùng class. Một component một trách nhiệm, giữ nhỏ.
- **Tách logic ra custom hook** (`useXxx`) khi dùng lại được; tuân thủ rules-of-hooks (gọi ở top level).
- **State đặt đúng chỗ**: cục bộ thì `useState`; chia sẻ gần thì lift up / context (`ProjectContext`, `ViewerModeContext`); **server state dùng Convex `useQuery`** (reactive, không cần React Query/polling) — đừng nhồi vào global store.
- **Data fetching**: xử lý đủ 3 trạng thái loading / error / empty; tránh fetch trong vòng lặp render.
- **Key danh sách** ổn định, không dùng index khi list có thể đổi thứ tự.
- **Effect đúng mục đích**: `useEffect` cho side-effect + dọn dẹp (cleanup); không dùng effect để tính giá trị dẫn xuất (tính thẳng khi render hoặc `useMemo`).
- **Tối ưu có đo lường**: chỉ `memo`/`useMemo`/`useCallback` khi thật sự cần; tránh tối ưu sớm.
- **Controlled component** cho form; validate rõ ràng.
- **A11y**: dùng thẻ ngữ nghĩa, `label` cho input, hỗ trợ bàn phím.

## Cạm bẫy thường gặp
- Thiếu/sai dependency array của `useEffect` → stale closure hoặc loop vô hạn.
- Lạm dụng global state cho dữ liệu server → khó đồng bộ, dễ lệch.
- Mutate trực tiếp state/props thay vì tạo bản mới.

## Tham chiếu
- `skills/frontend/convex-client.md` (đọc/ghi dữ liệu) · `skills/frontend/ui-guideline.md` · `core/coding-standards.md`
