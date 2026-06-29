<!-- Mục đích: dùng Convex phía client (React). Load khi UI đọc/ghi dữ liệu. -->
# Skill: Convex Client (React)

## Khi nào dùng
Component/page cần đọc dữ liệu real-time hoặc ghi qua Convex: `useQuery`, `useMutation`, `useAction`.

## Quy tắc / pattern
- **Provider một lần**: app bọc trong `<ConvexClientProvider>` (`components/convex-provider.tsx`), client tạo từ `NEXT_PUBLIC_CONVEX_URL`. Không tạo client rải rác.
- **Đọc reactive**: `const data = useQuery(api.tasks.list, { limit: 8 })` — tự cập nhật khi DB đổi, KHÔNG cần React Query/polling. `undefined` = đang load.
- **Ghi**: `const create = useMutation(api.tasks.create)`; gọi `await create({...})`. Bọc `try/catch`, báo lỗi qua `useToast()`.
- **Xử lý đủ trạng thái**: `undefined` (loading) / mảng rỗng (empty) / lỗi. Đừng render khi data còn `undefined`.
- **Project hiện tại**: lấy từ `useProject()` (`components/project-context.tsx`); fallback `projects?.[0]?._id` khi chưa chọn.
- **UI tokens**: chỉ dùng Design System V2 (`bg-base`, `bg-surface-1`, `border-border-default`, `text-secondary/tertiary`) — không `zinc-*` (BR-001).
- **Không raw `_id` trong UI** (trừ `key=`); hiển thị Display ID `AGT-XXX`.

## Cạm bẫy thường gặp
- Render `data.map` khi `data === undefined` → crash; check loading trước.
- Dùng `_id` làm text hiển thị → vi phạm pattern Display ID.
- Hardcode `NEXT_PUBLIC_CONVEX_URL` thay vì đọc env.

## Tham chiếu
- `skills/frontend/react.md` · `skills/frontend/ui-guideline.md` · `docs/patterns/DISPLAY-IDS.md`
- Backend tương ứng: `skills/backend/convex-functions.md` · ví dụ trang: `app/new-task/page.tsx`
