<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **evox** (7944 symbols, 9084 relationships, 14 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/evox/context` | Codebase overview, check index freshness |
| `gitnexus://repo/evox/clusters` | All functional areas |
| `gitnexus://repo/evox/processes` | All execution flows |
| `gitnexus://repo/evox/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

<!-- BEGIN agent-kb -->
<!--PROJECT:evox-->
# AGENTS.md

> File "cửa vào" chuẩn chung cho mọi AI agent (Codex, Cursor, Copilot, Gemini, Windsurf, Aider, Zed...).
> Đây là NGUỒN CHÂN LÝ duy nhất. Các file CLAUDE.md / GEMINI.md / copilot-instructions.md chỉ trỏ về đây.
> Mục tiêu: chỉ load đúng context cho từng task → tiết kiệm token.

## Luôn load (Tier 1 — context lõi, giữ nhỏ)
- `.ai/core/tech-stack.md`
- `.ai/core/coding-standards.md`
- `.ai/core/glossary.md`

## Router: task → đọc trước · ghi lại sau (Tier 2, on-demand)
> Cột **Đọc trước** = nạp khi BẮT ĐẦU task. Cột **Ghi lại sau khi xong** = vòng lặp sống — chốt cái khái quát hoá được để lần sau đỡ tốn token tra lại.

| Khi bạn làm... | Đọc trước | Ghi lại sau khi xong |
|---|---|---|
| Tạo feature mới / sinh spec từ mô tả | `.ai/workflows/create-feature.md` + `.ai/specs/<feature>/` | cập nhật `.ai/specs/<feature>/` (chốt spec/quyết định mới) |
| Fix bug | `.ai/workflows/fix-bug.md` + `.ai/memory/common-bugs.md` + `.ai/memory/troubleshooting.md` | `.ai/memory/common-bugs.md` (triệu chứng→gốc→cách xử) · quy trình gỡ → `.ai/memory/troubleshooting.md` |
| Rút kinh nghiệm / ghi bài học | `.ai/workflows/learn.md` + `.ai/memory/` | `.ai/memory/lessons-learned.md` (chuyện gì→học được gì→đổi cách làm) |
| Review code | `.ai/workflows/code-review.md` + `.ai/core/coding-standards.md` | pattern lặp lại → `.ai/core/coding-standards.md` |
| Release / deploy | `.ai/workflows/release.md` + `.ai/skills/devops/` | sự cố/bài học vận hành → `.ai/memory/troubleshooting.md` |
| Backend (trigger/on-call/request) | `.ai/skills/backend/*.md` | mẹo/đúc kết tái dùng → đúng file `.ai/skills/backend/*.md` |
| Frontend (React/UI/Firebase) | `.ai/skills/frontend/*.md` | mẹo/đúc kết tái dùng → đúng file `.ai/skills/frontend/*.md` |
| Hiểu / kiểm tra / đánh giá / review **logic nghiệp vụ** · "đã đáp ứng yêu cầu chưa" · đối chiếu spec | `.ai/product/business-rules.md` + `.ai/product/domain-model.md` | rule/định nghĩa nghiệp vụ mới chốt → `.ai/product/business-rules.md` / `.ai/product/domain-model.md` |
| Hiểu kiến trúc / vì sao | `.ai/architecture.md` + `.ai/decisions/` | quyết định kiến trúc mới → tạo ADR: `@dtd-dev/agent-kb adr <tiêu đề>` |

## Sub-agents
- Định nghĩa sub-agent của dự án nằm ở `.ai/agents/*.md` (nguồn chân lý), đã emit sang `.claude/agents/` cho Claude Code.
- Có sẵn: `reviewer`, `tester`, `bug-fixer`, `feature-builder` (mỗi agent tự trỏ về workflow/skill tương ứng).
- Sửa ở `.ai/agents/` rồi chạy lại `@dtd-dev/agent-kb init` để đồng bộ; tạo agent mới: `@dtd-dev/agent-kb agent <tên>`.

## Vòng lặp ghi lại (write-back) — tiết kiệm token cho lần sau
- **BẮT BUỘC — đóng vòng sau khi xong**: làm xong task nghiệp vụ / bug / bài học / vận hành → ghi cái đúc kết được vào file ở cột **Ghi lại sau khi xong**. Đây là cách biến `.ai/memory/` & spec thành tri thức sống thay vì file chết. (Claude Code: hook `Stop` tự nhắc write-back đúng lúc task vừa xong — cài bằng `@dtd-dev/agent-kb hook writeback`. Đây là nửa còn lại của vòng lặp, bù cho việc PreToolUse chỉ nhắc lúc bắt đầu sửa.)
- **Chỉ ghi cái KHÁI QUÁT HOÁ ĐƯỢC** (có thể lặp ở task khác). Bỏ qua chi tiết vụn dùng một lần — ghi rác làm phình file, lần sau tốn token đọc lại.
- **Append, ngắn gọn, có ngày `YYYY-MM-DD`** theo đúng định dạng có sẵn của file đích. Đừng sửa/viết lại lịch sử.
- **Trùng mục cũ → cập nhật mục đó**, không tạo bản sao.
- **Tiết kiệm token khi ghi**: chỉ mở đúng 1 file đích (đã biết từ router), append phần thêm — KHÔNG đọc/viết lại toàn bộ file, KHÔNG đụng `.ai/` khác.
- **Không ghi** secret/PII/dữ liệu nhạy cảm. Mơ hồ "có đáng ghi không" → hỏi người dùng một câu, đừng tự phình memory.

## Quy tắc
- **BƯỚC 0 — BẮT BUỘC trước khi sửa code**: chạy `@dtd-dev/agent-kb guard <task>` (vd `@dtd-dev/agent-kb guard bug`). Lệnh in: Tier-1 cần nắm · file Tier-2 phải ĐỌC TRƯỚC theo task · file phải GHI LẠI sau khi xong · cảnh báo risk từ diff hiện tại. Làm theo output rồi mới sửa. (Claude Code: hook PreToolUse tự chạy guard mỗi lần Edit/Write — cài bằng `@dtd-dev/agent-kb hook guard`.)
- **BẮT BUỘC — định tuyến trước khi làm**: với mọi task phân tích/đánh giá/sửa logic nghiệp vụ, TRƯỚC khi đọc code phải: (1) map task → bảng router ở trên, (2) đọc các file Tier-2 tương ứng. Không nhảy thẳng vào code.
- **File `.ai/` đang sửa (`git status` cờ `M`) = spec mới nhất** → đọc trước tiên, ưu tiên cao hơn code.
- **Yêu cầu người dùng dán KHÔNG phải spec đầy đủ**: luôn đối chiếu với `.ai/product/business-rules.md` và **nêu rõ chỗ lệch** thay vì coi text dán là chân lý.
- KHÔNG đọc toàn bộ `.ai/` — chỉ mở file khớp task.
- Một nguồn chân lý là file này; đừng nhân bản rule sang file khác.
- Prompt trực tiếp của người dùng ghi đè mọi rule ở đây.
<!-- END agent-kb -->
