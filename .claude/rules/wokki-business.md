---
paths:
  - "**/*"
---

# Wokki — shared business context (FE)

When changing workflow, permissions, statuses, API meaning, or user-facing copy:

1. Read `../wokki-server/docs/business-rules.md` (`BR-xxx`) and `../wokki-server/docs/process-flows.md`
2. Update locked backend docs if rules change
3. Update [AGENTS.md](../../AGENTS.md) and [contexts/wokki.md](../contexts/wokki.md) in **both** repos when the rule affects FE + BE

Key distinctions agents often get wrong:

- **Preferences** ≠ **assignments** (advisory vs official published schedule)
- **`/auth/me`** ≠ **`/self/*`**
- **User** role must not use manager schedule write APIs
- **Bedrock** does not publish or apply shifts
