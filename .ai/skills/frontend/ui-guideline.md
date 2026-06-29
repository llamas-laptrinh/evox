<!-- Mục đích: hướng dẫn UI/UX, design tokens. Load khi task thuộc loại này. -->
# Skill: UI Guideline

## Khi nào dùng
Dựng giao diện, đảm bảo nhất quán về spacing, màu, typography, trạng thái và accessibility.

## Quy tắc / pattern
- **Design token, không magic value**: màu/spacing/font lấy từ token tập trung (theme), không hardcode hex/px rải rác.
- **Thang spacing nhất quán**: dùng scale (vd 4/8/12/16/24/32). Không chế số lẻ tuỳ tiện.
- **Typography có hệ thống**: vài cấp heading/body rõ ràng; giới hạn số font/size.
- **Responsive mobile-first**: thiết kế cho màn nhỏ trước, mở rộng bằng breakpoint.
- **Đủ trạng thái UI**: luôn xử lý loading / empty / error / success — không chỉ happy path.
- **Phản hồi tương tác**: hover/focus/active/disabled rõ ràng; thao tác lâu phải có loading indicator.
- **Accessibility (WCAG)**: tương phản màu đạt chuẩn; focus nhìn thấy; điều hướng được bằng bàn phím; có `alt`/aria khi cần.
- **Component tái dùng**: ưu tiên component dùng chung thay vì copy style; giữ biến thể (variant) trong một nơi.

## Token dự án — Design System V2
> Nguồn đầy đủ: `docs/EVOX-DESIGN-SYSTEM.md`; token định nghĩa trong `app/globals.css` (`@theme inline`). **Cấm raw `zinc-*`/`gray-*`/`slate-*` (BR-001).**

| Thay vì | Dùng token |
|---|---|
| `bg-zinc-950` | `bg-base` |
| `bg-zinc-900` | `bg-surface-1` |
| `bg-zinc-800` | `bg-surface-4` |
| `border-zinc-800` | `border-border-default` |
| `text-zinc-300/400/500` | `text-primary` / `text-secondary` / `text-tertiary` |

- Font: Geist Sans + Geist Mono (`next/font`).
- Stack UI: Tailwind v4 + shadcn/ui; icon: lucide-react.
- Theme tối mặc định (`<html className="dark">`).

## Cạm bẫy thường gặp
- Hardcode màu/spacing → khó đổi theme, dễ lệch.
- Quên trạng thái empty/error → UI vỡ với dữ liệu thật.
- Bỏ qua focus/contrast → không dùng được bằng bàn phím / người khiếm thị.

## Tham chiếu
- `skills/frontend/react.md` · `core/coding-standards.md`
