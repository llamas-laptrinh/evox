# .ai — Knowledge base cho AI agent

Bản đồ context. AI đọc file này trước để biết **task → file cần load**, tránh nuốt cả thư mục.

## Tầng context
- **Tier 0 — Index**: file này.
- **Tier 1 — Core (LUÔN load)**: `core/*.md`. Giữ mỗi file < ~500 token.
- **Tier 2 — On-demand**: mọi thứ còn lại, chỉ đọc khi task đụng tới.

## Loading rules (task → file)
| Khi bạn làm... | Load thêm |
|---|---|
| Tạo feature mới / sinh spec từ mô tả | `workflows/create-feature.md` + `specs/<feature>/` |
| Fix bug | `workflows/fix-bug.md` + `memory/common-bugs.md` |
| Rút kinh nghiệm / ghi bài học | `workflows/learn.md` + `memory/` |
| Review code | `workflows/code-review.md` + `core/coding-standards.md` |
| Release / deploy | `workflows/release.md` + `skills/devops/` |
| Backend task (Convex query/mutation, action, cron) | `skills/backend/*.md` |
| Frontend task (React, UI, đọc/ghi Convex) | `skills/frontend/*.md` |
| Hiểu nghiệp vụ | `product/business-rules.md` + `product/domain-model.md` |
| Hiểu kiến trúc / vì sao thiết kế vậy | `architecture.md` + `decisions/` |

**Nguyên tắc:** không đọc file không khớp task. Nghi ngờ thì hỏi, đừng load thừa.

## Quy ước viết file
- 1 file = 1 nhiệm vụ. Phình to → tách hoặc đẩy xuống Tier 2.
- Tránh trùng lặp giữa các file (mỗi lần trùng = đốt token thừa).
- Đầu mỗi file ghi 1 dòng mục đích để AI quyết định có cần đọc không.
