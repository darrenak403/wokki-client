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

## Kiến trúc frontend

- **App Router** — Server Components mặc định; `"use client"` khi cần tương tác
- **Route groups:** `(landing)` marketing, `(auth)` đăng nhập/đăng ký
- **Colocated components:** `app/[route]/components/`; `components/shared/` (Header/Footer); `components/ui/` (shadcn)
- **State:** TanStack Query + Redux (auth)
- **API:** `lib/api/services/fetchXxx.ts`, cookie `authToken`, middleware RBAC
- **SEO:** `buildPageMetadata()`, `lib/seo/site.ts`

## Marketing routes (public)

| Route        | Mục đích     |
| ------------ | ------------ |
| `/`          | Trang chủ    |
| `/pricing`   | Bảng giá     |
| `/about`     | Về chúng tôi |
| `/help`      | Trợ giúp     |
| `/community` | Cộng đồng    |

Nav: `components/shared/site-nav.ts`

## Tailwind v4

- Token trong `app/globals.css` (`@theme`)
- Nền trắng chủ đạo; đen cho chữ tối nhất; xanh brand làm điểm nhấn

## Trước khi hoàn thành task UI

1. Nội dung người dùng → tiếng Việt; thuật ngữ UI → English nếu đã là convention
2. `npm run type-check` / `npm run build` khi đổi cấu trúc lớn

## Tài liệu tham chiếu

- `docs/fe/`, `.frontend-os/architecture/`, `docs/setup/SETUP.md`
