# `lib/` — cấu trúc cho agent

## Phân loại

| Lớp | Thư mục | Mục đích |
|-----|---------|----------|
| **HTTP** | `lib/api/` | Axios, envelope, `services/fetchXxx`, `query-keys` |
| **Support** | `lib/support/{domain}/` | Map lỗi, assert, session, helpers, auth, SEO — xem [`support/README.md`](support/README.md) |
| **Hooks** | `hooks/useXxx.ts` | TanStack Query — xem [`../hooks/README.md`](../hooks/README.md) |
| **Utils thuần** | `lib/utils/` | `cn`, format — không biết domain |
| **Hạ tầng** | `lib/redux/`, `lib/providers/` | Store, providers |

## `lib/support/` — quản lý support theo domain

```
lib/support/
  auth/          # Wave 1
  foundation/    # Wave 2
  schedule/      # Wave 3
  seo/           # Guest marketing
```

**Không** tạo `lib/auth/`, `lib/foundation/` ở root `lib/` nữa.

| Domain | Nội dung chính |
|--------|----------------|
| `auth` | JWT, cookies, `map-auth-error`, `app-routes` |
| `foundation` | `session-context`, `map-errors`, `assertFoundationSuccess` |
| `schedule` | `week`, `status`, `map-errors`, `assertScheduleSuccess` |
| `seo` | `metadata`, `site`, sitemap helpers |

## `lib/api/` — chỉ HTTP

```
lib/api/
  core.ts
  normalize-response.ts
  query-keys.ts
  services/fetchXxx.ts
```

Assert/map lỗi → `lib/support/{domain}/`, **không** `lib/api/{domain}/`.

## Import chuẩn

```ts
import { fetchSchedules } from "@/lib/api/services/fetchSchedules";
import { assertScheduleSuccess } from "@/lib/support/schedule/assert-success";
import { mapScheduleError } from "@/lib/support/schedule/map-errors";
import { readFoundationSession } from "@/lib/support/foundation/session-context";
import { getPostLoginPath } from "@/lib/support/auth/routing";
import { buildPageMetadata } from "@/lib/support/seo/metadata";
```

## Types

`types/{domain}.ts` — DTO, không nhét vào `lib/support/`.
