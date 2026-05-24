# Wokki Client — session bootstrap (Claude)

**Product:** Wokki Shift Ops — Next.js, Vietnamese UX, API `http://localhost:8386`.

**Read before coding:** `CLAUDE.md` → `../wokki-server/docs/business-rules.md` → `.claude/contexts/wokki.md`.

**Never violate:**
- Zones: business in `app/(app)/{admin|manager|user}/` only
- Copy: Vietnamese; keep `Dashboard`, `Admin`, `Manager`, `Export CSV` in English
- Preferences editable in **Draft** only; **Published** = view-only; preferences are advisory
- `/auth/me` ≠ `/self/*` · User must not call manager `/schedules/*` write APIs
- Auto-schedule UI: chi nhánh → phòng ban → tuần; branch policy required before suggest
- Bedrock = explanation only; scheduling works without it

**Code:** `fetchXxx` in `lib/api/services/` · `hooks/useXxx.ts` · `lib/support/{domain}/` · panels `*Panel.tsx` · update `components/app/app-nav.ts` for new routes.

**Verify:** `npm run type-check` before done.
