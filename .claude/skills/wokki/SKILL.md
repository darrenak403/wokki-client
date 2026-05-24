---
name: wokki
description: Load Wokki Shift Ops business rules, FE routes, hooks, and API integration. Use when building or changing admin/manager/user screens, schedule UI, swaps, attendance, payroll, chat, or Vietnamese copy.
---

# Wokki — business & codebase (client)

## When to use

- Any app screen under `app/(app)/`
- Schedule, preferences, suggest, Bedrock insight UI
- New `fetchXxx` / `useXxx` / error maps
- Copy that describes schedules, swaps, or permissions

## Read (in order)

1. [CLAUDE.md](../../CLAUDE.md) at repo root
2. [contexts/wokki.md](../contexts/wokki.md) — routes, hooks, panels
3. `../wokki-server/docs/business-rules.md` — `BR-xxx`
4. `../wokki-server/docs/vi/fe-integration-guide.md` — waves, auth, SignalR

## Implementation checklist

- [ ] Correct zone (`landing` | `auth` | `app`) and role path
- [ ] `components/app/app-nav.ts` updated if new route
- [ ] `fetchXxx` + `useXxx` + `lib/support/{domain}/map-errors.ts`
- [ ] Vietnamese user-facing strings
- [ ] `npm run type-check` passes
- [ ] Backend docs updated if API contract changed

## Common mistakes

| Mistake | Correct |
|---------|---------|
| `GET /auth/me` for employee schedule | `GET /self/schedule` |
| User calls manager schedule APIs | Role guard + correct fetch |
| Edit preferences when Published | View-only + copy explains advisory |
| Bedrock auto-publishes | Label as hỗ trợ / giải thích only |
| Hooks under `lib/hooks/` | Flat `hooks/useXxx.ts` |
