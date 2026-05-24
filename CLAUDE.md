# Wokki Client — Claude Code

> Claude loads this file automatically. Project kit lives in **`.claude/`**.

@.claude/contexts/wokki-bootstrap.md

@AGENTS.md

---

## Claude project map

| Path | Purpose |
|------|---------|
| [.claude/README.md](./.claude/README.md) | Index of `.claude/` |
| [.claude/contexts/wokki.md](./.claude/contexts/wokki.md) | **Full** routes, hooks, UX rules |
| [.claude/rules/wokki-frontend.md](./.claude/rules/wokki-frontend.md) | Rules on `app/`, `lib/`, `hooks/` |
| [.claude/rules/wokki-business.md](./.claude/rules/wokki-business.md) | `BR-xxx` + doc sync |
| [.claude/skills/wokki/SKILL.md](./.claude/skills/wokki/SKILL.md) | Skill: load Wokki context |
| [.claude/commands/ck/wokki.md](./.claude/commands/ck/wokki.md) | Slash: `/ck:wokki` |

**Cursor mirror:** `.cursor/rules/wokki-frontend.mdc`

**Backend (business truth):** `../wokki-server/docs/` · [../wokki-server/CLAUDE.md](../wokki-server/CLAUDE.md)

---

## Documentation

| # | Read |
|---|------|
| 1 | [AGENTS.md](./AGENTS.md) — FE structure, locale, zones |
| 2 | `../wokki-server/docs/business-rules.md` — **`BR-xxx`** |
| 3 | `../wokki-server/docs/vi/fe-integration-guide.md` — waves, auth, SignalR |
| 4 | [.claude/contexts/wokki.md](./.claude/contexts/wokki.md) |

---

## Business / UX essentials

- **Vietnamese** user copy; English for established terms (`Dashboard`, `Admin`, `Manager`, `Export CSV`)
- **Preferences:** edit in **Draft**, view-only when **Published**; advisory vs published assignments
- **Auto-schedule UI:** chi nhánh → phòng ban → tuần; branch policy before suggest
- **Bedrock:** hỗ trợ / giải thích only — scheduling without Bedrock must work
- **`/auth/me`** ≠ **`/self/*`** · User must not use manager schedule write APIs

---

## App zones

| Zone | Path |
|------|------|
| Marketing | `app/(landing)/` |
| Auth | `app/(auth)/` |
| App | `app/(app)/admin|manager|user/` |

Nav: `components/app/app-nav.ts` · Post-login: `lib/support/auth/app-routes.ts`

---

## Data flow

```text
page.tsx → *Panel.tsx → hooks/useXxx.ts → lib/api/services/fetchXxx.ts
  → lib/support/{domain}/map-errors.ts → types/
```

| Fetch | API |
|-------|-----|
| `fetchAuth`, `fetchUsers`, `fetchEmployees` | auth, users, employees |
| `fetchLocations`, `fetchDepartments`, `fetchShifts` | foundation |
| `fetchSchedules`, `fetchSchedulePreferences`, `fetchSchedulingConfig` | scheduling |
| `fetchSelf`, `fetchSwapRequests`, `fetchAttendance`, `fetchPayroll` | employee / ops |
| `fetchChat`, `fetchBedrock` | chat, insight |

Dev: http://localhost:6789 · API: http://localhost:8386 (`lib/api/get-api-base-url.ts`)

---

## Screens (by role)

Admin/Manager: dashboard, locations, departments, shifts, employees, users (admin), schedule, swap, attendance, payroll, chat.

User: dashboard, schedule (view), swap, attendance, chat.

Panels: `app/(app)/admin/{feature}/components/{Feature}Panel.tsx`

---

## Commands

```bash
cp .env.example .env.local   # once
npm run dev
npm run type-check           # before done
npm run build                # structural changes
```

**Next.js:** read `node_modules/next/dist/docs/` — version may differ from training data.

---

## Claude workflows

| Command / skill | Use |
|-----------------|-----|
| `/ck:wokki` | Load FE + `BR-xxx` context |
| `/ck:docs-fe` | Handoff doc for API changes |
| `/ck:cook` · `/ck:plan` · `/ck:fix` | Implement / plan / debug |
| Skill `wokki` | Routes, hooks, common mistakes |

---

## Definition of done

1. Correct zone + nav if new route  
2. Vietnamese copy (unless established English term)  
3. `npm run type-check` (and `npm run build` if structural)  
4. Backend docs + `.claude/contexts/wokki.md` if behavior changed  
