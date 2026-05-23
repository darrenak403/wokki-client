<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Wokki Client — Hướng dẫn cho Agent

## Ngôn ngữ & locale (bắt buộc)

**Wokki phục vụ người dùng Việt Nam.** Tách rõ hai lớp copy:

| Lớp                                   | Ngôn ngữ   | Ví dụ                                                                                                                                            |
| ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dữ liệu / nội dung cho người dùng** | Tiếng Việt | Mô tả sản phẩm, FAQ, toast, lỗi nghiệp vụ, nhãn form, SEO title/description, nav (Trang chủ, Bảng giá…)                                          |
| **Thuật ngữ UI & kỹ thuật quen**      | Tiếng Anh  | `Light` / `Dark`, `Dashboard`, `Export CSV`, `SSO`, tên gói `Starter` / `Business` / `Enterprise`, role `Admin` / `Manager` khi là nhãn hệ thống |
| **Code**                              | Tiếng Anh  | Biến, API path, Redux slice, types — không hiển thị raw lên UI                                                                                   |

**Quy tắc nhanh:**

- Câu giải thích, hướng dẫn, marketing, thông báo → **tiếng Việt**
- Một từ đã chuẩn trong app/SaaS toàn cầu → **giữ English**, không dịch máy (vd. không dùng «Sáng/Tối» thay `Light`/`Dark`)
- `html lang="vi"`, `SITE.locale` = `vi_VN`, VND, `dayjs` locale `vi`, GMT+7

## Kiến trúc UI — 3 vùng (bắt buộc)

**Hệ thống quản lý:** guest xem landing; sau đăng nhập vào **khu app theo role** — mọi chức năng nghiệp vụ chỉ trong `(app)/`.

| Vùng | Route group | URL ví dụ |
|------|-------------|-----------|
| Guest (marketing) | `(landing)/` | `/`, `/pricing`, `/about`, `/help`, `/community` |
| Auth | `(auth)/` | `/login`, `/register` |
| App (quản lý) | `(app)/` | `/admin/*`, `/manager/*`, `/user/*` |

Chi tiết: [`docs/fe/ui-architecture.md`](docs/fe/ui-architecture.md)

**Home sau login:** `Admin` → `/admin/dashboard`, `Manager` → `/manager/dashboard`, `User` → `/user/dashboard` (`lib/support/auth/app-routes.ts`).

**Khi thêm feature:** route mới dưới `app/(app)/{admin|manager|user}/`, cập nhật `components/app/app-nav.ts` — **không** đặt trên landing.

## Cấu trúc thư mục UI (agent phải tuân)

| Vùng | Route group | Pages | Components (colocated) | Shell chung |
|------|-------------|-------|------------------------|-------------|
| Guest | `app/(landing)/` | `page.tsx`, `pricing/`, … | `app/(landing)/components/` | `components/shared/` |
| Auth | `app/(auth)/` | `login/`, `register/` | `app/(auth)/login/components/`, … | `components/shared/` |
| App | `app/(app)/` | `admin/*`, `manager/*`, `user/*` | **`admin/{feature}/components/`** + `components/shared/admin/` | `components/app/` (`AppShell`, `app-nav.ts`) |

## Quy tắc đặt tên file/component

- **React component trong `app/**/components/` dùng PascalCase file name**: `HeroSection.tsx`, `HomePage.tsx`, `PricingCard.tsx`, `TeamAttendancePanel.tsx`.
- File export component chính nên trùng tên file: `export function HeroSection()`, `export function TeamAttendancePanel()`.
- **Next special files giữ nguyên lowercase theo framework**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- **Route folders giữ kebab/lowercase theo URL**: `user/schedule`, `admin/attendance`, `reset-password`.
- Non-component utilities/types trong `app/` nếu có thì dùng camelCase hoặc kebab-case theo convention local, nhưng không đặt dưới `components/` nếu không render UI.
- `components/ui/` là shadcn-generated primitives nên giữ convention của shadcn, thường là lowercase/kebab-case như `button.tsx`, `alert-dialog.tsx`; không rename các file này sang PascalCase.

**Quy tắc Landing (`(landing)`):**

- **Home page**: `app/(landing)/page.tsx` render `app/(landing)/components/HomePage.tsx`.
- **Shared landing components** dùng chung nhiều trang đặt trong `app/(landing)/components/` (ví dụ `HomePage.tsx` nếu chỉ dùng cho home nhưng nằm ở shared folder hiện tại).
- **Page-specific marketing pages** đặt component trong folder route riêng:
  - `app/(landing)/pricing/components/PricingPage.tsx`
  - `app/(landing)/about/components/AboutPage.tsx`
  - `app/(landing)/community/components/CommunityPage.tsx`
  - `app/(landing)/help/components/HelpPage.tsx`
- **Page files** trong landing vẫn mỏng: metadata + render component chính.
- Landing là vùng marketing công khai, không đặt logic nghiệp vụ sau đăng nhập, hooks TanStack Query nghiệp vụ, hoặc dashboard quản trị ở đây.
- Copy landing dùng tiếng Việt, hướng đến retail/F&B/dịch vụ theo ca; CTA chính thường dẫn `/register`, CTA phụ dẫn `/pricing`, `/help`, hoặc `/login`.
- Hero landing cần cho người dùng hiểu Wokki trong vài giây đầu: quản lý ca, lịch tuần, chấm công, đổi ca. Ưu tiên visual sản phẩm/dashboard preview, không dùng raw ID/API/data kỹ thuật.

**Quy tắc App (`(app)`):**

- **Panel / màn chính** → colocated cùng page: `app/(app)/admin/{feature}/components/` (vd. `admin/locations/components/LocationsPanel.tsx`)
- **Page** (`page.tsx`) mỏng — chỉ metadata + render panel từ `./components/` hoặc `@/app/(app)/admin/.../components/...`
- **Manager/User** reuse panel Admin (read-only): import từ `@/app/(app)/admin/{feature}/components/...` + prop `canWrite={false}` khi cần
- **Widget dùng chéo nhiều màn admin** (select, validator) → `components/shared/admin/` — **không** đặt panel ở đây
- **Không** tạo `components/app/{feature}/` — `components/app/` chỉ `AppShell`, `app-nav.ts`
- Logic/API: `lib/api/services/`, `hooks/useXxx.ts`, `lib/support/{domain}/`, `types/{domain}.ts` — xem [Hooks](#hooks-bắt-buộc), [`lib/README.md`](lib/README.md)

**Ví dụ Wave 2 (foundation):**

```
app/(app)/admin/locations/page.tsx
app/(app)/admin/locations/components/LocationsPanel.tsx
components/shared/admin/location-select.tsx
components/shared/admin/foundation-session-validator.tsx
app/(app)/manager/locations/page.tsx                 # import panel từ admin/locations/components
```

## Hooks (bắt buộc)

**Chủ:** `hooks/` phẳng — **không** subfolder, **không** `lib/hooks/`.

| Quy tắc | Ví dụ |
|---------|--------|
| File | `useXxx.ts` camelCase | `useAuth.ts`, `useSchedule.ts`, `useDepartments.ts` |
| Import | `@/hooks/useAuth` | |
| Export | `useXxx`, `useYyyQuery`, `useCreateZzzMutation` | `useScheduleListQuery` |

**Files hiện có:** `useAuth`, `useAuthSyncAcrossTabs`, `useLocations`, `useDepartments`, `useEmployees`, `useShifts`, `useUsers`, `useFoundationSession`, `useSchedule`.

**Quy tắc:**

- Mọi custom hook → **một file** trong `hooks/` (không `hooks/foundation/`).
- TanStack Query → `hooks/useResource.ts`; gọi `lib/api/services/` + `lib/support/{domain}/map-errors`.
- Wave mới → thêm `hooks/useEmployee.ts` (không tạo folder).

Chi tiết: [`hooks/README.md`](hooks/README.md).

## `lib/` — phân lớp (bắt buộc)

| Lớp | Path | Đặt gì |
|-----|------|--------|
| HTTP | `lib/api/` | `core`, `services/fetchXxx` — **không** `api/{domain}/` |
| **Support** | `lib/support/{domain}/` | Map lỗi, assert, session, helpers — `auth`, `foundation`, `schedule`, `seo` |
| Utils thuần | `lib/utils/` | `cn`, format — không domain |
| Hooks | `hooks/useXxx.ts` | TanStack Query — § Hooks |

**Không** tạo `lib/auth/`, `lib/foundation/` ở root — chỉ dưới `lib/support/`.

Chi tiết: [`lib/README.md`](lib/README.md), [`lib/support/README.md`](lib/support/README.md).

## Kiến trúc kỹ thuật

- **App Router** — Server Components mặc định; `"use client"` khi cần tương tác
- **Colocated components:** UI theo route group — xem bảng dưới; `components/ui/` (shadcn)
- **State:** TanStack Query + Redux (auth)
- **API:** `lib/api/services/fetchXxx.ts`, envelope `success` + `message.code`, cookie `authToken`, middleware RBAC
- **SEO:** `buildPageMetadata()` — app routes dùng `noindex: true`

## Tailwind v4

- Token trong `app/globals.css` (`@theme`)
- Nền trắng chủ đạo; đen cho chữ tối nhất; xanh brand làm điểm nhấn

## UI implementation — Tailwind + shadcn (bắt buộc toàn hệ thống)

- Ưu tiên dùng component trong `components/ui/` cho UI primitive: `Button`, `Card`, `Badge`, `Input`, `Select`, `Dialog`, `AlertDialog`, `Table`, `Tabs`, `ScrollArea`, `Tooltip`, v.v.
- Tailwind chỉ dùng để compose layout, spacing, responsive, state và token màu; không viết HTML thuần dài/lặp lại khi đã có shadcn component hoặc component local phù hợp.
- Khi một page có nhiều section/card giống nhau, tách thành component nhỏ colocated trong cùng file hoặc cùng `components/` của route: ví dụ `SectionHeader`, `PricingCard`, `StatCard`, `EmptyState`.
- Không nhúng CDN UI, inline `<script>`, CSS framework ngoài, hoặc copy raw HTML từ tool design vào app. Chuyển thiết kế sang React component dùng Tailwind token và shadcn.
- Form/control phải dùng primitive quen thuộc: `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Button`; trạng thái loading/error/disabled cần thể hiện qua props/class của component đó.
- Marketing, auth và app routes đều theo quy tắc này. Nếu cần visual mockup đặc thù, vẫn dựng bằng component có tên rõ ràng thay vì một khối JSX dài khó bảo trì.

## Trước khi hoàn thành task UI

1. Đúng vùng Guest / Auth / App; feature nghiệp vụ trong `(app)/`
2. Nội dung người dùng → tiếng Việt; thuật ngữ UI → English nếu đã là convention
3. `npm run type-check` / `npm run build` khi đổi cấu trúc lớn

## Tài liệu tham chiếu

- `docs/fe/ui-architecture.md`, `docs/fe/`, `.frontend-os/architecture/`, `docs/setup/SETUP.md`
