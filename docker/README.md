# Docker — Wokki Client

Cấu hình container trong `docker/`. Build context = root repo (`..`).

## Env (chuẩn — chỉ 3 file)

| File | Commit? | Dùng khi |
|------|---------|----------|
| `.env.example` | Có | Mẫu — hướng dẫn copy sang `.env` / `.env.local` |
| `.env.local` | Không (gitignore) | `npm run docker:dev` |
| `.env` | Không (gitignore) | `npm run docker:prod` |

Thiết lập lần đầu:

```bash
# Dev: chỉnh theo mục DEV trong .env.example
cp docker/.env.example docker/.env.local   # hoặc sửa trực tiếp .env.local đã có sẵn

# Prod: chỉnh theo mục PROD trong .env.example
cp docker/.env.example docker/.env         # hoặc sửa trực tiếp .env
```

`NEXT_PUBLIC_*` là URL mà **trình duyệt** gọi (không dùng tên service Docker nội bộ).

## Cấu trúc

```
docker/
  Dockerfile
  docker-compose.dev.yml    → env_file: .env.local
  docker-compose.prod.yml   → env_file: .env
  .env.example
  .env.local
  .env
  README.md
```

## Lệnh (repo root)

```bash
npm run docker:dev
npm run docker:dev:down
npm run docker:prod
npm run docker:prod:down
npm run docker:prod:build
```

## Ghi chú

- `.dockerignore` ở **repo root** bắt buộc (mirror: `docker/.dockerignore`).
- Dev: hot reload, volume mount, `node_modules` riêng.
- Prod: Next.js `standalone`, healthcheck `GET /`.
