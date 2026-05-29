<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Wokki Client — Agent Rules

**Claude Code:** [CLAUDE.md](./CLAUDE.md) · [.claude/README.md](./.claude/README.md) · `/ck:wokki` · **Map:** [.claude/contexts/wokki.md](./.claude/contexts/wokki.md) · **BE docs:** `../wokki-server/docs/`

## Business Rules

- Always update agents/docs when business behavior changes. If a task adds, removes, or changes workflow, permissions, statuses, API business meaning, or user-facing business copy, update relevant docs, `AGENTS.md`, `CLAUDE.md`, and agent context in the same task without waiting for the user to ask.
- If a rule affects both apps, update both `wokki-client/AGENTS.md` and `wokki-server/AGENTS.md`, plus the matching `CLAUDE.md` files; also check backend docs such as `docs/brd.md`, `docs/business-rules.md`, `docs/process-flows.md`, and API/FE handoff docs.
- UI copy must reflect business meaning accurately. Example: employee shift preferences are advisory; official work schedules are decided and published by Admin/Manager.
- Shift preferences: users may edit while schedule is `Draft`; once `Published`, preferences are view-only. Official work schedule = published `ShiftAssignment`.
- Branch workspace access: Admin sees all chi nhánh **trong tổ chức (JWT `organization_id`)**; Manager sees only chi nhánh assigned by Org Admin through `LocationManager`. User accounts with no Active branch membership are gated before protected app routes: no membership shows `/join`, Pending/Rejected/Left/Transferred shows `/pending`; Org Admin/Manager of the target chi nhánh approves the request before the employee is managed/scheduled there.
- Self-serve org: `POST /auth/register` with `organizationName` creates org + Org Admin + JWT. **PlatformOperator** (`admin@gmail.com` seed) uses `/platform` only — no org app routes. Staff are created by Org Admin via `POST /employees` (not self-register); show `temporaryPassword` once.
- Auto-scheduling UX must follow the business hierarchy: choose chi nhánh → phòng ban → tuần. Branch `LocationSchedulingPolicy` is mandatory: a short form for the 9 supported solver rules plus optional custom branch notes Admin/Manager can add. Custom branch notes are stored/displayed but not read by CP-SAT until they become typed solver rules. Suggest UI should surface missing setup with clear actions instead of generic empty states.
- Bedrock schedule insight: Bedrock is an optional support chat over a generated weekly schedule context snapshot. It must be presented as advisory explanation only, never as the engine that creates/applies/publishes assignments. Scheduling flows must remain usable when Bedrock is unavailable.

## Language And Locale

- Wokki serves Vietnamese users.
- User-facing explanations, marketing, forms, toasts, business errors, nav labels, SEO copy: Vietnamese.
- Keep common SaaS/system terms in English when that is the established UI convention: `Light`, `Dark`, `Dashboard`, `Export CSV`, `SSO`, `Admin`, `Manager`.
- Code identifiers, API paths, Redux slices, types: English.
- Locale defaults: `html lang="vi"`, `SITE.locale = vi_VN`, VND, Vietnamese date locale, GMT+7.

## App Zones

Business features belong only in `(app)/`.

| Zone            | Route group      | Examples                                         |
| --------------- | ---------------- | ------------------------------------------------ |
| Guest marketing | `app/(landing)/` | `/`, `/pricing`, `/about`, `/help`, `/community` |
| Auth            | `app/(auth)/`    | `/login`, `/register`                            |
| Role app        | `app/(app)/`     | `/admin/*`, `/manager/*`, `/user/*`              |

- Post-login home: Admin `/admin/dashboard`, Manager `/manager/dashboard`, User `/user/dashboard` (`lib/support/auth/app-routes.ts`).
- New app feature routes go under `app/(app)/{admin|manager|user}/` and update `components/app/app-nav.ts`.
- Do not place logged-in business logic on landing pages.

## File Structure

- Route pages stay thin: metadata plus render a colocated panel/component.
- App panels live beside pages, usually `app/(app)/admin/{feature}/components/{Feature}Panel.tsx`.
- Manager/User pages may reuse Admin panels with props such as `canWrite={false}` when appropriate.
- Cross-screen admin widgets go in `components/shared/admin/`.
- `components/app/` is only app shell/nav, not feature panels.
- Logic/API/types belong in `lib/api/services/`, `hooks/useXxx.ts`, `lib/support/{domain}/`, and `types/{domain}.ts`.

## Naming

- React components in `app/**/components/`: PascalCase filenames and matching main export, e.g. `TeamAttendancePanel.tsx` / `export function TeamAttendancePanel`.
- Next special files stay lowercase: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- Route folders stay lowercase/kebab-case by URL.
- `components/ui/` follows shadcn naming; do not rename generated primitives.

## Landing

- `app/(landing)/page.tsx` renders `app/(landing)/components/HomePage.tsx`.
- Shared landing components live in `app/(landing)/components/`.
- Page-specific marketing components live under the route, e.g. `app/(landing)/pricing/components/PricingPage.tsx`.
- Landing copy is Vietnamese and aimed at retail/F&B/service shift operations.
- Hero should quickly communicate shift scheduling, weekly schedules, attendance, and swaps. Prefer product/dashboard visuals over raw IDs/API details.

## Hooks

- All custom hooks live flat in `hooks/`; no hook subfolders and no `lib/hooks/`.
- Hook filenames: `useXxx.ts`; imports: `@/hooks/useXxx`.
- TanStack Query hooks call `lib/api/services/fetchXxx.ts` and map errors via `lib/support/{domain}/map-errors`.
- Export names follow `useXxx`, `useYyyQuery`, `useCreateZzzMutation`.

## `lib/`

| Layer   | Path                    | Contents                                                |
| ------- | ----------------------- | ------------------------------------------------------- |
| HTTP    | `lib/api/`              | `core`, `services/fetchXxx`; no `api/{domain}/` folders |
| Support | `lib/support/{domain}/` | error maps, assertions, sessions, helpers               |
| Utils   | `lib/utils/`            | generic utilities only                                  |
| Hooks   | `hooks/useXxx.ts`       | TanStack Query hooks                                    |

- Do not create root `lib/auth/` or `lib/foundation/`; use `lib/support/auth/`, `lib/support/foundation/`, etc.

## Tech Stack

- Next App Router; Server Components by default; add `"use client"` only for interactivity.
- State: TanStack Query + Redux auth.
- API: `lib/api/services/fetchXxx.ts`, envelope `success` + `message.code`, `authToken` cookie, `proxy.ts` RBAC.
- SEO: `buildPageMetadata()`; app routes should be `noindex`.

## Tailwind And UI

- Tailwind v4 tokens live in `app/globals.css` (`@theme`).
- Brand colors: `--brand-navy`, `--brand-medium`, `--brand-blue`, `--brand-light`, `--brand-mist`, `--brand-surface`, `--brand-deep`.
- Prefer white/light surfaces, neutral dark text, and brand blue as the main accent.
- **Always use `components/ui/` primitives — never raw HTML equivalents:**
  - `<Label>` not `<label>` or `<span>` for form labels
  - `<Input>` not `<input type="text/email/number/password">`
  - `<Textarea>` not `<textarea>`
  - `<Checkbox>` not `<input type="checkbox">`
  - `<Select>` / `<SelectTrigger>` / `<SelectContent>` / `<SelectItem>` not `<select>` / `<option>`
  - `<Switch>` not `<input type="checkbox">` for toggle behavior
  - `<Button>` not `<button>`
- Tailwind composes layout/spacing/responsive/state/token colors. Avoid long raw HTML when a shadcn/local component fits.
- Forms use: `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Button`; include loading/error/disabled states.
- No CDN UI, inline scripts, external CSS frameworks, or raw design-tool HTML.

## Before Finishing UI Work

1. Confirm the route is in the correct zone: Guest, Auth, or App.
2. Confirm user-facing copy is Vietnamese unless it is an established English UI term.
3. Run `npm run type-check`; run `npm run build` for larger structural changes.

## References

- `docs/fe/ui-architecture.md`
- `docs/fe/`
- `.frontend-os/architecture/`
- `docs/setup/SETUP.md`
