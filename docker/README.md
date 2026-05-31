# Docker — Wokki Client (FE)

## GitHub Secrets (chỉ 2 — cả 2 repo BE/FE)

| Secret | Mục đích |
| ------ | -------- |
| `DOCKER_USERNAME` | Login + push Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub |

**Mọi biến khác** → env trên **Dokploy** hoặc `docker/.env`.

## Env trên Dokploy (runtime — bắt buộc cho prod)

| Variable | Giá trị prod |
| -------- | ------------ |
| `DOCKER_USERNAME` | Docker Hub username |
| `NEXT_PUBLIC_API_URL` | `https://api.wokki.beyond8.io.vn` |
| `NEXT_PUBLIC_APP_URL` | `https://wokki.beyond8.io.vn` |
| `NEXT_PUBLIC_APP_NAME` | Optional — `Wokki` |
| `NEXT_PUBLIC_ENV` | `production` |

Container start ghi `public/__runtime-env.js` từ các biến trên — **không cần** GitHub Variables.

## CI/CD → Dokploy

```
push main → GitHub Actions build/push (chỉ image, không bake URL)
         → Dokploy pull ${DOCKER_USERNAME}/wokki-client:latest
         → compose up + env NEXT_PUBLIC_*
```

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
