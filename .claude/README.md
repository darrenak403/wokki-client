# Claude Code — Wokki Client

Open this repo as the workspace root. Claude auto-loads **[../CLAUDE.md](../CLAUDE.md)**.

## Start here

| Priority | File |
|----------|------|
| 1 | [../CLAUDE.md](../CLAUDE.md) — entry (`@` imports bootstrap + AGENTS) |
| 2 | [contexts/wokki.md](./contexts/wokki.md) — routes, hooks, UX |
| 3 | `../wokki-server/docs/business-rules.md` — `BR-xxx` |
| 4 | `../wokki-server/docs/vi/fe-integration-guide.md` — waves, SignalR |

**Session hook** injects [contexts/wokki-bootstrap.md](./contexts/wokki-bootstrap.md) on every `SessionStart`.

## Slash commands

| Command | File |
|---------|------|
| `/ck:wokki` | [commands/ck/wokki.md](./commands/ck/wokki.md) |
| `/ck:docs-fe` | [commands/ck/docs-fe.md](./commands/ck/docs-fe.md) |
| `/ck:cook` | [commands/ck/cook.md](./commands/ck/cook.md) |
| `/ck:plan` | [commands/ck/plan.md](./commands/ck/plan.md) |
| `/ck:fix` | [commands/ck/fix.md](./commands/ck/fix.md) |

## Skills

| Skill | Path |
|-------|------|
| **wokki** | [skills/wokki/SKILL.md](./skills/wokki/SKILL.md) |
| code-review | [skills/code-review/SKILL.md](./skills/code-review/SKILL.md) |

## Rules

| Rule | Scope |
|------|-------|
| [wokki-frontend.md](./rules/wokki-frontend.md) | `app/`, `lib/`, `hooks/`, `components/` |
| [wokki-business.md](./rules/wokki-business.md) | All files |

## Hooks

[settings.json](./settings.json) — build check (`npm run type-check` / build), session bootstrap.

**Backend:** `../wokki-server` → [../wokki-server/.claude/README.md](../wokki-server/.claude/README.md)
