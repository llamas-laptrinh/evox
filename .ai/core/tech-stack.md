<!-- Mục đích: stack + version. Chỉ liệt kê, KHÔNG giải thích. Giữ thật ngắn. -->
# Tech Stack — EVOX

## Backend
- Ngôn ngữ + framework: TypeScript + **Convex** (serverless query/mutation/action + DB real-time)
- Database: Convex (built-in, reactive). Self-host qua Docker — xem `docs/SELF-HOSTED-LOCAL.md`
- Scheduler: Convex crons (`convex/crons.ts`) — heartbeats, monitors, The Loop SLA
- Tích hợp ngoài: Linear SDK (`@linear/sdk`, OPTIONAL), GitHub/Slack webhooks

## Frontend
- Stack: Next.js 16 (App Router) + React 19
- State: Convex reactive (`useQuery`/`useMutation`) — KHÔNG Redux/Zustand. UI state qua React Context (`ProjectContext`, `ViewerModeContext`)
- UI: Tailwind CSS v4 + shadcn/ui + lucide-react; charts: recharts; drag-drop: dnd-kit

## Infra / DevOps
- Container: Docker (Convex self-hosted local)
- Deploy: Vercel → evox-ten.vercel.app
- CI/CD: GitHub Actions
- Test: Vitest (unit/integration) + Playwright (e2e)

## Quy tắc version
- Không nâng major version nếu chưa ghi vào `decisions/`.
- Mọi UI dùng Design System V2 tokens — xem `business-rules.md` BR-001.
