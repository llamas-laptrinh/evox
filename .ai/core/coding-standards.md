<!-- Mục đích: quy tắc clean code áp dụng mọi nơi. Quy tắc, không phải ví dụ (ví dụ ở examples/). -->
# Coding Standards

## Naming
- Theo convention của ngôn ngữ (vd JS/TS: biến/hàm `camelCase`, type/class `PascalCase`, hằng `UPPER_SNAKE`).
- Tên nói rõ ý định; tránh viết tắt mơ hồ và tiền tố thừa.

## Hàm & module
- Một hàm làm một việc; giữ ngắn (ưu tiên < ~30 dòng).
- Tránh nesting sâu — dùng early return.
- Không magic number/string — đặt tên hằng.
- Tách side-effect khỏi logic thuần để dễ test.

## Error handling
- Không nuốt lỗi im lặng; log có ngữ cảnh (đủ để debug, không lộ dữ liệu nhạy cảm).
- Tách rõ lỗi nghiệp vụ vs lỗi hệ thống.
- Validate input ở biên (boundary), tin tưởng dữ liệu bên trong.

## Comment & docs
- Comment giải thích "vì sao", không lặp "cái gì". Code tự diễn đạt được thì bỏ comment thừa.

## Test
- Logic nghiệp vụ phải có test; phủ cả happy path lẫn ca lỗi/biên.
- Tên test mô tả hành vi, không mô tả tên hàm.

## Format & Git
- Theo ESLint của repo (`eslint.config.mjs`, `eslint-config-next`); không tranh luận style thủ công.
- Commit nhỏ, message theo Conventional Commits (`feat:`/`fix:`/`chore:`…).

## EVOX-specific (bắt buộc)
- UI chỉ dùng Design System V2 tokens — không raw `zinc-*`/`gray-*`. (BR-001)
- Không raw `_id` trong UI (trừ `key=`); dùng Display ID `AGT-XXX`. Ref: `docs/patterns/DISPLAY-IDS.md`.
- Định danh agent = string name, resolve qua `resolveAgentNameById()`. (BR-003)
- Search trước khi tạo file mới — EDIT thay vì tạo trùng. (BR-002)
- Quality gates trước commit: `npx next build`, không `zinc-*`, không raw `_id`, `git status` sạch.
