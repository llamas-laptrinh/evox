# Run EVOX Fully Local (No Linear, No Convex Cloud)

This guide runs EVOX entirely on your machine:

- **Convex** → self-hosted in Docker (open-source backend + dashboard).
- **Linear** → not used. Tasks are created from the built-in **`/new-task`** page
  (calls `api.tasks.create` directly). The dashboard reads the same `tasks` table,
  so new tasks appear in real time.

No `LINEAR_API_KEY` and no Convex Cloud account are required.

---

## Prerequisites

- Docker (with `docker compose`)
- Node.js 18+ and npm

## 1. Start the Convex backend

```bash
docker compose up -d
```

This launches:

| Service | URL | Purpose |
|---------|-----|---------|
| `convex-backend` | http://127.0.0.1:3210 | API / client connections |
| (HTTP actions) | http://127.0.0.1:3211 | site origin |
| `convex-dashboard` | http://127.0.0.1:6791 | admin UI for tables/functions |

Data persists in the `convex_data` Docker volume.

## 2. Generate an admin key

```bash
docker compose exec convex-backend ./generate_admin_key.sh
```

Copy the printed key — you'll use it in the next step.

## 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` so it contains (replace the admin key with yours):

```bash
# Point the Convex CLI at the self-hosted backend
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=<paste admin key from step 2>

# Point the Next.js client at the same backend
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211

# LINEAR_API_KEY — intentionally omitted (not used in local mode)
# ANTHROPIC_API_KEY — only needed if you run the headless agent executor
```

## 4. Push schema + functions to the local backend

In a separate terminal, keep this running:

```bash
npx convex dev
```

It deploys the schema and all `convex/` functions to your local backend and watches for changes.

## 5. Seed the database

The `tasks.create` mutation needs at least one **project** and the **agents** to exist.
Seed them once:

```bash
npx convex run seed:seedDatabase
npx convex run seed:seedSkills    # optional — agent skill levels
npx convex run seed:seedQuinn     # optional — QA agent
```

## 6. Run the app

```bash
npm run dev
```

- Open **http://localhost:3000/new-task** to add a task (title, description, priority, optional assignee).
- Open **http://localhost:3000/dashboard** to see it appear in real time.

---

## What changed for local mode

- **`docker-compose.yml`** — self-hosted Convex backend + dashboard.
- **`convex/crons.ts`** — two production-only crons are commented out for local:
  - `sync-linear` — would error every 5 min without a `LINEAR_API_KEY`.
  - `website-health-check` — pings production URLs (Vercel/Convex Cloud) that read as "down" locally, spamming false alerts + Linear ticket attempts.
  - (Heartbeats, stuck-agent / recovery / SLA monitors still run — they have no external deps.)
- **`convex/maxMonitor.ts`** — fixed `storeReport`/`triggerAlert` arg validators (`v.object({})` → real args) so the 15-min monitor cron stops throwing `ArgumentValidationError`.
- **`next.config.ts`** — CSP `connect-src` now also allows the configured Convex backend (derived from `NEXT_PUBLIC_CONVEX_URL`/`SITE_URL`), so the self-hosted `http/ws://127.0.0.1:3210` isn't blocked. **Changing `next.config.ts` requires restarting `npm run dev`.**
- **`app/new-task/page.tsx`** — the local task-entry page replacing Linear input.

## Notes

- Tasks created locally have no `linearId` — that's expected; all Linear fields are optional in the schema.
- To wire Linear back up later: set `LINEAR_API_KEY`, uncomment the `sync-linear` cron in `convex/crons.ts`.
- For production self-hosting (Postgres/MySQL + S3 instead of SQLite/local disk), see the
  [upstream self-hosting guide](https://github.com/get-convex/convex-backend/tree/main/self-hosted).
- Stop everything with `docker compose down` (add `-v` to also wipe the database volume).
