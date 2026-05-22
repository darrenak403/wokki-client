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

**Home sau login:** `Admin` → `/admin/dashboard`, `Manager` → `/manager/dashboard`, `User` → `/user/dashboard` (`lib/auth/app-routes.ts`).

**Khi thêm feature:** route mới dưới `app/(app)/{admin|manager|user}/`, cập nhật `components/app/app-nav.ts` — **không** đặt trên landing.

## Cấu trúc thư mục UI (agent phải tuân)

| Vùng | Route group | Pages | Components (colocated) | Shell chung |
|------|-------------|-------|------------------------|-------------|
| Guest | `app/(landing)/` | `page.tsx`, `pricing/`, … | `app/(landing)/components/` | `components/shared/` |
| Auth | `app/(auth)/` | `login/`, `register/` | `app/(auth)/login/components/`, … | `components/shared/` |
| App | `app/(app)/` | `admin/*`, `manager/*`, `user/*` | **`admin/{feature}/components/`** + `components/shared/admin/` | `components/app/` (`AppShell`, `app-nav.ts`) |

**Quy tắc App (`(app)`):**

- **Panel / màn chính** → colocated cùng page: `app/(app)/admin/{feature}/components/` (vd. `admin/locations/components/locations-panel.tsx`)
- **Page** (`page.tsx`) mỏng — chỉ metadata + render panel từ `./components/` hoặc `@/app/(app)/admin/.../components/...`
- **Manager/User** reuse panel Admin (read-only): import từ `@/app/(app)/admin/{feature}/components/...` + prop `canWrite={false}` khi cần
- **Widget dùng chéo nhiều màn admin** (select, validator) → `components/shared/admin/` — **không** đặt panel ở đây
- **Không** tạo `components/app/{feature}/` — `components/app/` chỉ `AppShell`, `app-nav.ts`
- Logic/API: `lib/api/services/`, `lib/hooks/foundation/`, `lib/foundation/`, `types/foundation.ts`

**Ví dụ Wave 2 (foundation):**

```
app/(app)/admin/locations/page.tsx
app/(app)/admin/locations/components/locations-panel.tsx
components/shared/admin/location-select.tsx
components/shared/admin/foundation-session-validator.tsx
app/(app)/manager/locations/page.tsx                 # import panel từ admin/locations/components
```

## Kiến trúc kỹ thuật

- **App Router** — Server Components mặc định; `"use client"` khi cần tương tác
- **Colocated components:** UI theo route group — xem bảng dưới; `components/ui/` (shadcn)
- **State:** TanStack Query + Redux (auth)
- **API:** `lib/api/services/fetchXxx.ts`, envelope `success` + `message.code`, cookie `authToken`, middleware RBAC
- **SEO:** `buildPageMetadata()` — app routes dùng `noindex: true`

## Tailwind v4

- Token trong `app/globals.css` (`@theme`)
- Nền trắng chủ đạo; đen cho chữ tối nhất; xanh brand làm điểm nhấn

## Trước khi hoàn thành task UI

1. Đúng vùng Guest / Auth / App; feature nghiệp vụ trong `(app)/`
2. Nội dung người dùng → tiếng Việt; thuật ngữ UI → English nếu đã là convention
3. `npm run type-check` / `npm run build` khi đổi cấu trúc lớn

## Tài liệu tham chiếu

- `docs/fe/ui-architecture.md`, `docs/fe/`, `.frontend-os/architecture/`, `docs/setup/SETUP.md`
