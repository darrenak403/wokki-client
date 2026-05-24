# Wokki Client — Claude Code

Frontend **Wokki Shift Ops MVP**: Next.js App Router, TanStack Query, Redux auth, Vietnamese UX, consumes `wokki-server` at `/api/v1`.

**Coding rules (mandatory):** [AGENTS.md](./AGENTS.md) · Cursor: [.cursor/rules/wokki-frontend.mdc](./.cursor/rules/wokki-frontend.mdc) · Claude: [.claude/rules/wokki-frontend.md](./.claude/rules/wokki-frontend.md)

**Product & codebase map:** [.cursor/contexts/wokki.md](./.cursor/contexts/wokki.md) (mirror: [.claude/contexts/wokki.md](./.claude/contexts/wokki.md))

**Business source of truth (backend docs):** `../wokki-server/docs/` — especially [brd.md](../wokki-server/docs/brd.md), [business-rules.md](../wokki-server/docs/business-rules.md), [vi/fe-integration-guide.md](../wokki-server/docs/vi/fe-integration-guide.md).

---

## Before you change behavior

| # | Read | Why |
|---|------|-----|
| 1 | [AGENTS.md](./AGENTS.md) | FE structure, locale, zones |
| 2 | `../wokki-server/docs/business-rules.md` | Locked `BR-xxx` |
| 3 | `../wokki-server/docs/vi/fe-integration-guide.md` | Auth, waves, `/auth/me` vs `/self/*` |
| 4 | [.cursor/contexts/wokki.md](./.cursor/contexts/wokki.md) | Routes, hooks, API map |

When business behavior changes, update `AGENTS.md`, `wokki-server` locked docs, and this repo’s `contexts/wokki.md` in the same task.

---

## Non-negotiable UX / business

- **Locale:** User-facing copy **Vietnamese**; keep established English UI terms (`Dashboard`, `Export CSV`, `Admin`, `Manager`, `Light`/`Dark`).
- **Schedule preferences:** Editable while schedule is **Draft**; **view-only** when **Published**. Copy must say preferences are advisory; official schedule = published assignments.
- **Auto-scheduling UI:** Chi nhánh → phòng ban → tuần; branch `LocationSchedulingPolicy` mandatory before suggest; surface missing setup with actions.
- **Bedrock:** Optional advisory chat only — never present as the engine that creates/applies/publishes shifts; scheduling works when Bedrock is down.
- **Roles:** `Admin` / `Manager` / `User` — routes under `app/(app)/{admin|manager|user}/`; RBAC via `proxy.ts` + `lib/support/auth/`.

---

## App zones

| Zone | Path | Examples |
|------|------|----------|
| Marketing | `app/(landing)/` | `/`, `/pricing`, `/help` |
| Auth | `app/(auth)/` | `/login`, `/register` |
| App | `app/(app)/` | `/admin/*`, `/manager/*`, `/user/*` |

Post-login home: `lib/support/auth/app-routes.ts` → `/admin/dashboard`, `/manager/dashboard`, `/user/dashboard`.

Nav source: `components/app/app-nav.ts` — update when adding app routes.

---

## Data flow (standard pattern)

```text
page.tsx (thin) → *Panel.tsx (app/(app)/.../components/)
  → hooks/useXxx.ts
  → lib/api/services/fetchXxx.ts
  → lib/support/{domain}/map-errors.ts + assert-success.ts
  → types/{domain}.ts
```

- **No** `lib/api/{domain}/` subfolders — all fetchers in `lib/api/services/`.
- **No** hooks under `lib/` — flat `hooks/useXxx.ts` only.
- Envelope: check `success`, then `data`; errors via `message.code`.

---

## API services ↔ backend

| `lib/api/services/` | Backend area |
|---------------------|--------------|
| `fetchAuth.ts` | `/api/v1/auth` |
| `fetchUsers.ts` | `/api/v1/users` |
| `fetchEmployees.ts` | `/api/v1/employees` |
| `fetchLocations.ts` | `/api/v1/locations` (+ policy) |
| `fetchDepartments.ts` | `/api/v1/departments` |
| `fetchShifts.ts` | `/api/v1/shifts` |
| `fetchSchedules.ts` | `/api/v1/schedules` |
| `fetchSchedulePreferences.ts` | preferences on schedule |
| `fetchSchedulingConfig.ts` | dept/branch scheduling config |
| `fetchSelf.ts` | `/api/v1/self` |
| `fetchSwapRequests.ts` | `/api/v1/swap-requests` |
| `fetchAttendance.ts` | `/api/v1/attendance` |
| `fetchPayroll.ts` | `/api/v1/payroll` |
| `fetchChat.ts` | `/api/v1/channels` + SignalR |
| `fetchBedrock.ts` | `/api/v1/bedrock`, schedule insights |
| `fetchHealth.ts` | `/health` |

Base URL: `lib/api/get-api-base-url.ts` — default `http://localhost:8386`.

---

## Feature screens (implemented)

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| Dashboard | `/admin/dashboard` | `/manager/dashboard` | `/user/dashboard` |
| Chi nhánh / PB / Ca / NS | ✓ | mostly read/write | — |
| Lịch ca | `/admin/schedule` | `/manager/schedule` | `/user/schedule` (view) |
| Đổi ca | `/admin/swap` | `/manager/swap` | `/user/swap` |
| Chấm công | `/admin/attendance` | `/manager/attendance` | `/user/attendance` |
| Lương | `/admin/payroll` | `/manager/payroll` | — |
| Chat | `/admin/chat` | `/manager/chat` | `/user/chat` |

Panels: colocated under `app/(app)/admin/{feature}/components/`; Manager/User often reuse with `canWrite={false}`.

---

## `lib/support/` domains

See [lib/support/README.md](./lib/support/README.md): `auth/`, `foundation/`, `schedule/`, `schedule-preference/`, `scheduling-config/`, `employee/`, `payroll/`, `chat/`, `seo/`.

---

## Commands

```bash
cp .env.example .env.local   # once
npm run dev                  # :6789
npm run type-check           # before done
npm run build                # larger changes
```

---

## Next.js note

This repo may use a **newer Next.js** than training data — read `node_modules/next/dist/docs/` for deprecations before changing routing or APIs.

---

## Agent toolkit

Same **cursor-skills** tree in `.cursor/` and `.claude/` as backend repo. Use `contexts/wokki.md` for product work; `skills/code-review/` before claiming complete.

**FE handoff command:** `/ck:docs-fe` (`.claude/commands/ck/docs-fe.md`) — documents changed API contracts for FE.

---

## Definition of done

1. Correct app zone and nav updated if new route  
2. Vietnamese copy (unless established English term)  
3. `npm run type-check` (and `npm run build` for structural changes)  
4. Business docs + `contexts/wokki.md` updated if behavior changed  
