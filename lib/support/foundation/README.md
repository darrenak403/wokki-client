# `lib/support/foundation/` — Wave 2 domain support

| File | Loại | Mô tả |
|------|------|--------|
| `session-context.ts` | Client state | `sessionStorage` location / department |
| `get-foundation-state.ts` | Snapshot | Context cho wave sau |
| `map-errors.ts` | API errors | `mapFoundationError` — mã `LOCATION_*`, `EMPLOYEE_*`, … |
| `assert-success.ts` | API envelope | `assertFoundationSuccess` — dùng trong `fetchLocations`, … |

HTTP calls: `lib/api/services/fetch*.ts` · Hooks: `hooks/useLocations.ts`, `useDepartments.ts`, … · Types: `types/foundation.ts`
