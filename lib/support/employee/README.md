# Employee self-service support

| File | Role |
|------|------|
| `assert-success.ts` | Map API envelope failures |
| `map-errors.ts` | User-facing messages (`SWAP_POST_*`, attendance, profile) |
| `swap-post-status.ts` | Labels for `SwapPostType` / `SwapPostStatus`, shift line formatter |
| `normalize-swap-post.ts` | Map BE string enums (`Cover`, `Pending`, …) → numeric FE constants |

HTTP: `fetchSelf`, `fetchSwapPosts`, `fetchAttendance` · Hooks: `useMySchedule`, `useSwapPosts`, `useAttendance`
