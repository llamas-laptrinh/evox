<!-- Mục đích: build & chạy bằng Docker. Load khi task thuộc loại này. -->
# Skill: Docker

## Khi nào dùng
Chạy local bằng container/compose. Ở EVOX, Docker chủ yếu để **self-host Convex backend** (`docker-compose.yml` + `docs/SELF-HOSTED-LOCAL.md`) — app Next.js deploy trên Vercel, không cần đóng gói image. Các pattern dưới áp dụng khi cần containerize service riêng.

## Quy tắc / pattern
- **Multi-stage build**: tách stage build và runtime; image cuối chỉ chứa artifact + runtime cần thiết.
- **Base image nhỏ & ghim version**: dùng `slim`/`alpine`/`distroless`; ghim tag cụ thể, không dùng `latest`.
- **Tận dụng layer cache**: copy file manifest (`package.json`/`go.mod`...) và cài deps TRƯỚC khi copy source.
- **`.dockerignore`**: loại `node_modules`, `.git`, build artifact, `.env` để build nhanh & tránh lộ secret.
- **Chạy non-root**: tạo user riêng, `USER app`; không chạy bằng root.
- **Cấu hình qua ENV**, không hardcode; secret truyền lúc runtime, không bake vào image.
- **HEALTHCHECK** để orchestrator biết container sống/chết.
- Một process chính mỗi container; log ra stdout/stderr.

## Cạm bẫy thường gặp
- `COPY . .` trước khi cài deps → vỡ cache, build lại từ đầu mỗi lần.
- Bake secret/`.env` vào image (còn trong layer history dù đã xoá).
- Image phình do để cả devDependencies/build tool trong stage runtime.

## Tham chiếu
- Build/deploy: `skills/devops/deployment.md`, `skills/devops/github-actions.md`
- Stack & version: `core/tech-stack.md`
