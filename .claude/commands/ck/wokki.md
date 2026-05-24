---
description: Load Wokki FE context — routes, hooks, BR-xxx, and integration guide
argument-hint: [optional topic keyword, e.g. schedule | swap | chat]
---

Load Wokki client context for this session.

**Argument:** `$ARGUMENTS` (optional — focus area)

## Steps

1. Read [CLAUDE.md](../../../CLAUDE.md) (repo root)
2. Read [.claude/contexts/wokki.md](../../contexts/wokki.md)
3. Skim `../wokki-server/docs/business-rules.md` and `../wokki-server/docs/vi/fe-integration-guide.md`
4. If argument provided, grep `app/`, `hooks/`, `lib/api/services/` for that topic
5. Reply with a **short** summary (≤15 bullets):
   - Relevant routes (admin/manager/user)
   - Hooks + fetch files
   - UX rules (Draft/Published, Vietnamese copy)
   - `npm run type-check` gate
   - Whether backend docs/API change is needed

Do not start implementation until the user confirms or asks to proceed.
