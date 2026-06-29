# EVOX Mission Control — Agent Rules

Auto-loaded every Claude Code session. Last updated: Feb 6, 2026.

## Project

| Key | Value |
|-----|-------|
| Stack | Next.js 14 App Router + Convex + Tailwind v4 + shadcn/ui |
| Deploy | Vercel → evox-ten.vercel.app |
| Repo | github.com/sonpiaz/evox |
| Design System | V2 — [docs/EVOX-DESIGN-SYSTEM.md](docs/EVOX-DESIGN-SYSTEM.md) |

**Read First:** [docs/VISION.md](docs/VISION.md) — Org DNA. [docs/CULTURE.md](docs/CULTURE.md) — How we work.

## Team Territories

| Agent | Territory | Files |
|-------|-----------|-------|
| Sam | Backend | `convex/`, `lib/evox/`, `scripts/` |
| Leo | Frontend | `app/`, `components/` |
| Quinn | QA | `*.test.ts`, `e2e/`, code review |
| Max | PM | Linear docs, planning, coordination |

Cross-territory edits allowed — just report in #dev.

---

## Architecture Rules (MANDATORY)

### Rule 1: Design System V2 Tokens — No Raw Color Classes

All UI code MUST use semantic V2 tokens. **Never use `zinc-*`, `gray-*`, `slate-*` for theming.**

| Instead of | Use |
|-----------|-----|
| `bg-zinc-950` | `bg-base` |
| `bg-zinc-900` | `bg-surface-1` |
| `bg-zinc-800` | `bg-surface-4` |
| `border-zinc-800` | `border-border-default` |
| `text-zinc-400` | `text-secondary` |
| `text-zinc-500` | `text-tertiary` |
| `text-zinc-300` | `text-primary` |

Full token reference: [docs/EVOX-DESIGN-SYSTEM.md](docs/EVOX-DESIGN-SYSTEM.md). Tokens defined in `app/globals.css` `@theme inline` block.

### Rule 2: No New Files Without Search

Before creating ANY new file, search for existing ones. `grep -rn "Name" components/ --include="*.tsx" -l`
**If similar exists → EDIT it.** We have 7 dashboard variants from agents creating instead of editing.

### Rule 3: Agent Identity — String Names, NOT Convex IDs

Canonical identifier: `"sam"`, `"leo"`, `"max"`, `"quinn"`. Never compare `v.id("agents")` with string names — resolve with `resolveAgentNameById()` first.

### Rule 4: Single Source of Truth

| Constant | Source |
|----------|--------|
| Agent list/valid agents | `convex/agentRegistry.ts` |
| Status codes/SLA/labels | `convex/messageStatus.ts` |

**Never hardcode agent lists like `["sam", "leo", "max"]`.**

### Rule 5: One Messaging Table

All new code → `unifiedMessages`. Legacy tables (`agentMessages`, `messages`, `meshMessages`) are read-only.

### Rule 6: No New Schema Tables Without CEO Approval

48 tables already. Check if existing table can be extended first.

### Rule 7: Proof of Work

Ticket "Done" requires: commit hash + files changed + build passes. **No commit = not done.**

### Rule 8: Delete Dead Code

Replace = delete old file + remove imports + verify build. Don't leave code "just in case."

### Rule 9: Max File Size

Components: 300 lines. Convex files: 500 lines. Split if exceeded.

---

## Quality Gates

| Check | Command |
|-------|---------|
| Build passes | `npx next build` |
| No raw `_id` in UI | `grep -rn "\._id" app/ components/ --include="*.tsx" \| grep -v "key="` |
| No zinc-* classes | `grep -rn "zinc-" app/ components/ --include="*.tsx"` |
| All committed | `git status` |

---

## Playbooks

| When | Link |
|------|------|
| Session start | [docs/playbooks/SESSION-START.md](docs/playbooks/SESSION-START.md) |
| Pre-commit | [docs/playbooks/PRE-COMMIT.md](docs/playbooks/PRE-COMMIT.md) |
| Task complete | [docs/playbooks/TASK-COMPLETE.md](docs/playbooks/TASK-COMPLETE.md) |

## Patterns

| Pattern | Link |
|---------|------|
| Display IDs | [docs/patterns/DISPLAY-IDS.md](docs/patterns/DISPLAY-IDS.md) |
| Status Colors | [docs/patterns/STATUS-COLORS.md](docs/patterns/STATUS-COLORS.md) |
| Attribution | [docs/patterns/ATTRIBUTION.md](docs/patterns/ATTRIBUTION.md) |
| Convex Actions | [docs/patterns/CONVEX-ACTIONS.md](docs/patterns/CONVEX-ACTIONS.md) |

## Architecture Decisions

ADR-001 through ADR-006: [docs/decisions/](docs/decisions/)

---

## Security Rules

1. **No hardcoded secrets** — API keys, tokens, passwords → `.env.local` only
2. **Pre-commit** — Grep for secrets before every commit
3. **Review** [docs/LESSONS.md](docs/LESSONS.md) — Learn from past mistakes

## Self-Improvement Rules

1. **After a mistake** — add a lesson to MEMORY.md `Lessons Learned` section immediately
2. **If a pattern repeats 3x** — propose a new Architecture Rule in CLAUDE.md
3. **If a rule is wrong** — fix it in CLAUDE.md, don't silently ignore it
4. **After every session** — run `/session-end` to capture what was learned
5. **Before complex work** — run `/plan` to get approval before writing code

## CLAUDE.md Maintenance

- Keep under 200 lines (currently ~145). Move details to docs/ if growing.
- Update when architecture changes (new rules, removed rules, new patterns)
- Don't duplicate MEMORY.md content — CLAUDE.md = rules, MEMORY.md = state
- Review accuracy during `/session-end` — remove stale rules, update counts
- Any agent can propose edits; CEO (EVOX) approves architecture changes

---

## Session End Protocol

Run `./scripts/restart-agent.sh <agent>` before restarting. Script captures output, collects lessons, logs session. **No other restart method allowed.**

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **evox** (7996 symbols, 9151 relationships, 17 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
@AGENTS.md

<!-- Claude Code đọc file này. Dòng @import ở trên kéo toàn bộ AGENTS.md vào. -->
<!-- Cần rule riêng cho Claude Code (vd 3-layer memory) thì thêm bên dưới, KHÔNG lặp lại nội dung AGENTS.md. -->
<!-- END agent-kb -->
