# `hooks/` — toàn bộ React hooks

Mọi custom hook nằm **phẳng** trong `hooks/` — **một file = một hook module**, tên file **camelCase** trùng prefix export (`useAuth.ts` → `useAuth`, `useDepartments.ts` → `useDepartmentsQuery`).

**Không** tạo subfolder (`hooks/foundation/`, `lib/hooks/`).

## Cấu trúc

```
hooks/
  useAuth.ts
  useAuthSyncAcrossTabs.ts
  useLocations.ts
  useDepartments.ts
  useEmployees.ts
  useShifts.ts
  useUsers.ts
  useFoundationSession.ts
  useSchedule.ts
```

## Quy tắc đặt tên

| Quy tắc | Ví dụ |
|---------|--------|
| File | `use` + PascalCase + `.ts` | `useSchedule.ts` |
| Import | `@/hooks/useSchedule` | |
| Export query | `useXxxQuery` | `useDepartmentsQuery` |
| Export mutation | `useCreateXxxMutation` | `useCreateScheduleMutation` |

## Nội dung theo wave

| File | Wave | Gọi |
|------|------|-----|
| `useAuth`, `useAuthSyncAcrossTabs` | 1 | Redux, cookies |
| `useLocations` … `useUsers`, `useFoundationSession` | 2 | `fetch*` foundation + `lib/support/foundation/map-errors` |
| `useSchedule` | 3 | `fetchSchedules` + `lib/support/schedule/map-errors` |

Wave mới → thêm **một file** `hooks/useEmployee.ts` (không folder con).
