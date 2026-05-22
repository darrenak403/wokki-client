# `lib/support/` — domain & cross-cutting support

Code **hỗ trợ nghiệp vụ / kỹ thuật** theo wave hoặc vertical — **không** phải HTTP transport (`lib/api/`) và **không** phải React hooks (`hooks/`).

## Cấu trúc

```
lib/support/
  auth/          # Wave 1 — JWT, cookie, RBAC routes, map-auth-error
  foundation/    # Wave 2 — sessionStorage, map-errors, assert-success
  schedule/      # Wave 3 — week/status helpers, map-errors, assert-success
  employee/      # Wave 4 — self/swap/attendance map-errors, assert-success
  seo/           # Guest — metadata, sitemap, JSON-LD
```

## Phân loại file trong mỗi domain

| Loại | Ví dụ | Đặt ở |
|------|--------|--------|
| **Map lỗi API** | `map-errors.ts` | `foundation/`, `schedule/` |
| **Assert envelope** | `assert-success.ts` | `foundation/`, `schedule/` |
| **Client state** | `session-context.ts` | `foundation/` |
| **Business helper** | `week.ts`, `status.ts` | `schedule/` |
| **Auth / RBAC** | `jwt-roles.ts`, `app-routes.ts` | `auth/` |
| **SEO** | `metadata.ts`, `site.ts` | `seo/` |

## Import chuẩn

```ts
import { mapFoundationError } from "@/lib/support/foundation/map-errors";
import { assertScheduleSuccess } from "@/lib/support/schedule/assert-success";
import { getPostLoginPath } from "@/lib/support/auth/routing";
import { buildPageMetadata } from "@/lib/support/seo/metadata";
```

## Wave mới

Thêm `lib/support/{domain}/` với `map-errors.ts` + `assert-success.ts` (+ helpers). Types vẫn ở `types/{domain}.ts`, hooks ở `hooks/useXxx.ts`, fetch ở `lib/api/services/`.

## Không đặt ở đây

- `lib/utils/` — format, `cn` (thuần, không domain)
- `lib/api/` — axios, `fetchXxx`
- `hooks/` — TanStack Query
- `types/` — DTO TypeScript
