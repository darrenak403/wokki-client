# Docker — Wokki Client (FE)

## GitHub Secrets

| Secret | Mục đích |
| ------ | -------- |
| `DOCKER_USERNAME` | Login + push Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub |
| `DOKPLOY_WEBHOOK_URL` | Bắt buộc — trigger Dokploy redeploy sau khi push image (Dokploy UI → app `wokki-client` → tab Deployments → copy Webhook URL) |
| `DOKPLOY_API_TOKEN` | Optional, **thường không cần** — chỉ set nếu Dokploy báo 401/403 khi gọi webhook |

Optional GitHub repo **Variable**: `APP_HEALTH_URL` (default `https://wokki.io.vn/`) nếu domain prod đổi.

**Mọi biến khác** → env trên **Dokploy** hoặc `docker/.env`.

## Env trên Dokploy (runtime — bắt buộc cho prod)

| Variable | Giá trị prod |
| -------- | ------------ |
| `DOCKER_USERNAME` | Docker Hub username |
| `NEXT_PUBLIC_API_URL` | `https://api.wokki.io.vn` |
| `NEXT_PUBLIC_APP_URL` | `https://wokki.io.vn` |
| `NEXT_PUBLIC_APP_NAME` | Optional — `Wokki` |
| `NEXT_PUBLIC_ENV` | `production` |

> **Cookie (optional):** `NEXT_PUBLIC_COOKIE_DOMAIN=.wokki.io.vn` nếu cần cookie auth chia subdomain.

Container start ghi `public/__runtime-env.js` từ các biến trên — **không cần** GitHub Variables.

## CI/CD → Dokploy (tự động)

```
push main → GitHub Actions build/push (chỉ image, không bake URL)
         → job "deploy": POST DOKPLOY_WEBHOOK_URL (tự động, không cần bấm tay)
         → Dokploy pull ${DOCKER_USERNAME}/wokki-client:latest + compose up (env NEXT_PUBLIC_*)
         → job "deploy": poll / đến khi container healthy, fail loudly nếu timeout
```

Không còn bước thủ công — chỉ cần `git push` lên `main`. Nếu `DOKPLOY_WEBHOOK_URL` chưa set, job `deploy` fail rõ ràng để nhắc cấu hình secret.

Deploy **sau BE** — FE join network `wokki-network` (external).

Cloudflare Tunnel → port **6789**.

## Env files

| File | Dùng khi |
| ---- | -------- |
| `docker/.env.example` | Template |
| `docker/.env.local` | `npm run docker:dev` |
| `docker/.env` | `npm run docker:prod` |

## Prod compose

File: `docker/docker-compose.prod.yml`

| Service | Container | Image |
| ------- | --------- | ----- |
| Client | `wokki_client` | `${DOCKER_USERNAME}/wokki-client:latest` |

Env Dokploy: `DOCKER_USERNAME`, `NEXT_PUBLIC_*`, `CLIENT_PORT` (optional).

```bash
npm run docker:prod:pull
npm run docker:prod
```

## Dev

```bash
npm run docker:dev
npm run docker:dev:down
```

Hot reload port **6789**.

### Tối ưu (prod)

| | Chi tiết |
|---|----------|
| **Image** | Alpine standalone, non-root, npm cache build, GHA cache CI |
| **Runtime env** | `entrypoint.js` → `/__runtime-env.js` |
| **Concurrency** | `UV_THREADPOOL_SIZE=4`, `NODE_OPTIONS=--max-old-space-size=384` |
| **Log** | Giới hạn 10MB × 3 file |
| **RAM** | Limit 512M — tune `CLIENT_MEMORY_LIMIT` |

### CI reliability notes

- `docker-publish.yml` dùng retry 2 lần cho build/push để giảm lỗi mạng Docker Hub.
- Workflow verify lại `latest` bằng pull ngay sau publish; nếu pull thất bại nhiều lần sẽ fail sớm.
- Prod compose hỗ trợ `DOCKER_PLATFORM` (mặc định `linux/amd64`) để tránh lệch kiến trúc.
