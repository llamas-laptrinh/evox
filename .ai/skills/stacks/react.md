<!-- Mục đích: chuẩn React/TypeScript frontend. Load khi task đụng UI React. -->
# Stack: React

## Quy tắc / pattern
- **Function component + hooks**; một component một trách nhiệm, giữ nhỏ. Không class.
- **Tách logic dùng lại ra custom hook** (`useXxx`); tuân rules-of-hooks (gọi ở top level).
- **State đúng chỗ**: cục bộ `useState`; chia sẻ gần → lift up/context; **server state** dùng Convex `useQuery` (reactive) — đừng nhồi vào global store.
- **Data fetching**: xử lý đủ loading/error/empty; không fetch trong vòng render.
- **`useEffect`** cho side-effect + cleanup; không dùng để tính giá trị dẫn xuất (tính khi render hoặc `useMemo`); dependency array đúng.
- **Key danh sách** ổn định, không dùng index khi list đổi thứ tự.
- **Tối ưu có đo lường**: `memo`/`useMemo`/`useCallback` chỉ khi cần.
- **A11y**: thẻ ngữ nghĩa, `label` cho input, điều hướng bàn phím.

## Cạm bẫy thường gặp
- Sai/thiếu dependency `useEffect` → stale closure hoặc loop vô hạn.
- Lạm dụng global state cho dữ liệu server → khó đồng bộ.
- Mutate trực tiếp state/props.

## Tham chiếu
- `core/coding-standards.md` · `skills/frontend/ui-guideline.md`
