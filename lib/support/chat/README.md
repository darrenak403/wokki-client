# Chat support (Wave 6)

- `map-errors.ts` — `CHAT_*` codes
- `assert-success.ts` — envelope guard
- `my-employee-id.ts` — session cache (no `employeeId` on `/auth/me`)

Realtime: `lib/realtime/chat-hub.ts` (hub `/ws/chat`). App notifications: `lib/realtime/signalr.ts` (`/hubs/app`).
