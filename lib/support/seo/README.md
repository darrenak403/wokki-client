# `lib/support/seo/` — Guest / marketing (không phải wave app RBAC)

| File | Loại | Mô tả |
|------|------|--------|
| `metadata.ts` | SEO | `buildPageMetadata` cho pages |
| `site.ts` | Config | Site URL, locale |
| `fetch-public-seo.ts` | Data | Sitemap / public entries |
| `root-json-ld.tsx` | Component | JSON-LD layout |
| `request-site-url.ts` | Server helper | Resolve URL request |

Dùng từ `(landing)/`, `app/layout`, `sitemap.ts` — **không** map lỗi API nghiệp vụ.
