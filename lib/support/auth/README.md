# `lib/support/auth/` — Wave 1 authentication & RBAC

| File | Loại | Mô tả |
|------|------|--------|
| `map-auth-error.ts` | API errors | Login/register codes |
| `jwt-roles.ts` | Token | Decode role từ JWT |
| `session-cookies.ts` | Session | Token / role cookies |
| `app-routes.ts` | RBAC | Prefix `/admin`, `/manager`, `/user` |
| `routing.ts` | Redirect | Post-login path |
| `resolve-request-role.ts` | Middleware | Role từ request |
| `normalize-role.ts` | Transform | Chuẩn hóa role string |
| `validation-errors.ts` | Form | Map validation từ envelope |

**Không** đặt map lỗi domain (`LOCATION_*`, `SCHEDULE_*`) ở đây — dùng `lib/support/foundation/map-errors`, `lib/support/schedule/map-errors`.
