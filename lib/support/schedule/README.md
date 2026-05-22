# `lib/support/schedule/` — Wave 3 domain support

| File | Loại | Mô tả |
|------|------|--------|
| `week.ts` | Business helper | Thứ Hai, `weekDayDates` (BR-020) |
| `status.ts` | Business helper | Badge, `isScheduleEditable` |
| `map-errors.ts` | API errors | `mapScheduleError` — mã `SCHEDULE_*` |
| `assert-success.ts` | API envelope | `assertScheduleSuccess` — dùng trong `fetchSchedules` |

HTTP calls: `lib/api/services/fetchSchedules.ts` · Hooks: `hooks/useSchedule.ts` · Types: `types/schedule.ts`
