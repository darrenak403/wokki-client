# Wokki Client — Product & codebase context

**Business source of truth:** `../wokki-server/docs/business-rules.md` (`BR-xxx`), `../wokki-server/docs/fe/self-serve-org-handoff.md`, `../wokki-server/docs/fe/2026-05-29-feat-platform-org-subscription.md`.

---

## Product (one paragraph)

**Wokki** helps retail/F&B/service teams run **weekly shift schedules**, **shift swaps**, **attendance**, **payroll prep**, and **internal chat** across organization tenants. Vietnamese-first UI. Managers **publish** the official schedule; employees register **preferences** (advisory) while the week is **Draft**. Auto-scheduling needs branch policy first; Bedrock is optional explanation-only chat.

---

## Implementation waves (FE order)

```text
Wave 1 Auth → Wave 2 Foundation (location, dept, employee, shift)
  → Wave 3 Schedule (manager) → Wave 4 Employee self
  → Wave 5 Manager ops (swap, attendance, payroll)
  → Wave 6 Chat (parallel after auth)
```

**Do not** call manager `/schedules/*` from **User** role. **Do not** confuse `GET /auth/me` with `GET /self/*`.

---

## Route map

### Marketing (`app/(landing)/`)

`/`, `/pricing`, `/about`, `/help`, `/community` — Vietnamese copy, SEO via `lib/support/seo/`.

### Auth (`app/(auth)/`)

`/login`, `/register` — cookie `authToken`, Redux `authSlice`, redirect via tenant routes. Register creates org + Org Admin, but org package starts NotActivated until Wokki admin enables it.

### App (`app/(app)/`)

Tenant app routes are branch-scoped for business actions: `/{orgId}/{locationId}/{role}/...`. `/{orgId}/{role}/workspace` is a redirect/branch-selection fallback, not an all-branch workspace.

Org staff creation is not a separate "system account" flow. The FE must use `POST /employees` for staff/Manager creation so BE creates both `User` and `Employee` plus active branch membership; same-org legacy Users without Employee are linked through this flow. Do not call `POST /users` to create org staff.

| Module | Admin panel path | Notes |
|--------|------------------|-------|
| Dashboard | `[orgId]/[locationId]/admin/dashboard` | |
| Tổ chức | `[orgId]/[locationId]/admin/workspace` + `LocationDetailDrawer` | Selected branch only; separate explicit org view needed for all branches |
| Phòng ban | `admin/departments` | Chi nhánh → phòng ban → nhân viên (không có vị trí con) |
| Ca | `admin/shifts` | Shift definitions |
| Nhân sự | `admin/employees` | Links User ↔ Employee |
| Tài khoản | `admin/users` | Admin-only |
| Lịch ca | `admin/schedule` | Grid, assign, publish, suggest, Bedrock insight UI |
| Đổi ca | `admin/swap` | Nhật ký đổi ca (read-only) |
| Chấm công | `admin/attendance` | `TeamAttendancePanel` |
| Lương | `admin/payroll` | CSV export |
| Chat | `admin/chat` | `ChatPanel`, SignalR |

Manager routes mirror under `manager/*` (see `components/app/app-nav.ts`). User: `user/schedule`, `user/swap`, `user/attendance`, `user/chat`.

### Platform (`/platform`)

PlatformOperator only. No org sidebar. Use `GET /platform/stats`, `GET /platform/users`, `GET /platform/organizations`, and `PUT /platform/organizations/{id}/subscription` to activate/disable/renew org packages.

---

## Layer map

| Layer | Location | Convention |
|-------|----------|------------|
| Pages | `app/**/page.tsx` | Metadata + render panel only |
| Panels | `app/(app)/**/components/*Panel.tsx` | Main UI logic |
| Shared admin UI | `components/shared/admin/` | Cross-feature widgets |
| Shell / nav | `components/app/` | Not feature panels |
| UI primitives | `components/ui/` | shadcn — don't rename |
| Fetch | `lib/api/services/fetchXxx.ts` | One file per API area |
| Hooks | `hooks/useXxx.ts` | TanStack Query |
| Support | `lib/support/{domain}/` | map-errors, assert-success, helpers |
| Types | `types/*.ts` | DTOs mirroring API |

### Hooks ↔ API

| Hook | Fetch / concern |
|------|-----------------|
| `useAuth` | `fetchAuth` |
| `useUsers` | `fetchUsers` |
| `useEmployees` | `fetchEmployees` |
| `useLocations` | `fetchLocations` |
| `useDepartments` | `fetchDepartments` |
| `useShifts` | `fetchShifts` |
| `useSchedule` | `fetchSchedules` |
| `useSchedulePreferences`, `usePreferenceBoard` | preferences |
| `useMySchedule` | `fetchSelf` |
| `useSwapPosts` | `fetchSwapPosts`, `fetchSelf.getDraftWeekAssignments` |
| `useAttendance` | attendance |
| `usePayroll` | payroll |
| `useChat`, `useChatHub` | REST + SignalR |
| `useBedrockAiAvailable` | optional AI |
| `useSignalR`, `useSignalRNotifications` | hubs |

---

## Auth & RBAC

- `proxy.ts` — route protection by role
- `lib/support/auth/jwt-roles.ts`, `session-user.ts`, `app-routes.ts`
- Post-login paths per role: PlatformOperator → `/platform`; org Admin/Manager/User → tenant app only when package is active.
- Map `ORG_PACKAGE_NOT_ACTIVATED` to "Bạn chưa có gói sử dụng hệ thống." and `ORG_PACKAGE_EXPIRED` to "Bạn phải gia hạn để tiếp tục dùng hệ thống."; clear org session and do not render protected app shell.

---

## Schedule UI rules (copy & behavior)

| State | Manager/Admin | User (preferences) |
|-------|---------------|---------------------|
| **Draft** | Edit assignments, suggest, apply, publish | Edit preferences |
| **Published** | Unpublish (if allowed) | View preferences; official schedule read-only |

Show clear empty states when branch policy missing — link to location policy setup.

Bedrock panels: label as **hỗ trợ / giải thích**, not auto-publish.

---

## Error handling pattern

```ts
// hooks call fetch → map-errors → toast/UI message (Vietnamese)
import { mapScheduleError } from "@/lib/support/schedule/map-errors";
```

Add `map-errors.ts` + `assert-success.ts` per new domain under `lib/support/{domain}/`.

---

## Env & ports

- Client dev: `http://localhost:6789` (`.env.local` from `.env.example`)
- API: `NEXT_PUBLIC_API_URL` → `http://localhost:8386`

---

## When adding a screen

1. Route under correct zone + role folder  
2. Entry in `components/app/app-nav.ts`  
3. `fetchXxx` + `useXxx` + `types` + `lib/support`  
4. Vietnamese strings; English only for established terms  
5. Update `../wokki-server/docs` if API contract or `BR-xxx` changes  

---

## Claude quick commands

| Command | Purpose |
|---------|---------|
| `/ck:wokki` | Load BR-xxx + route/hook map |
| `/ck:docs-fe` | API handoff after BE changes |
| Skill `wokki` | `.claude/skills/wokki/SKILL.md` |

**Auto-loaded:** `CLAUDE.md` + `wokki-bootstrap.md` on session start.
