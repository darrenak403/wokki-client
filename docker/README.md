# Docker — Wokki Client

Cấu hình container trong `docker/`. Build context = root repo (`..`).

## CI/CD → Dokploy

```
GitHub Actions (push main)
  → build image + bake NEXT_PUBLIC_*
  → push Docker Hub: ${DOCKER_USERNAME}/wokki-client:latest
  → Dokploy pull & redeploy (registry credentials trên Dokploy)
```

### GitHub (repo wokki-client)

| Loại | Tên | Ghi chú |
| ---- | --- | ------- |
| Secret | `DOCKER_USERNAME` | Docker Hub username |
| Secret | `DOCKER_PASSWORD` | Docker Hub access token |
| Variable | `NEXT_PUBLIC_API_URL` | `https://api.wokki.beyond8.io.vn` |
| Variable | `NEXT_PUBLIC_APP_URL` | `https://wokki.beyond8.io.vn` |
| Variable | `NEXT_PUBLIC_APP_NAME` | Optional, default `Wokki` |
| Variable | `NEXT_PUBLIC_ENV` | Optional, default `production` |

`NEXT_PUBLIC_*` **chỉ có hiệu lực lúc CI build** — không override được sau khi image đã push.

### Dokploy (app FE)

| Cấu hình | Giá trị |
| -------- | ------- |
| Loại | Docker Compose |
| Compose file | `docker/docker-compose.prod.yml` |
| Registry | Docker Hub (`DOCKER_USERNAME` + token trong Dokploy) |
| Env runtime | `DOCKER_USERNAME`, `IMAGE_TAG` (optional), `CLIENT_PORT` (optional) |

**Deploy BE stack trước** — BE tạo network `wokki-network`, FE join (`external: true`).

Cloudflare Tunnel → port **6789**.

## Env files (local / manual)

| File | Commit? | Dùng khi |
|------|---------|----------|
| `.env.example` | Có | Mẫu |
| `.env.local` | Không | `npm run docker:dev` |
| `.env` | Không | `npm run docker:prod`, `docker:prod:pull` |

```bash
cp docker/.env.example docker/.env.local   # dev
cp docker/.env.example docker/.env         # prod build/pull local
```

## Lệnh (repo root)

```bash
npm run docker:dev
npm run docker:dev:down

# Pull & run (VPS / test local)
npm run docker:prod:pull
npm run docker:prod
npm run docker:prod:down
```

Build image: GitHub Actions (push `main`) hoặc thủ công:

```bash
docker build -f docker/Dockerfile --target runner \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/ \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com \
  --build-arg NEXT_PUBLIC_APP_NAME=Wokki \
  --build-arg NEXT_PUBLIC_ENV=production \
  -t ${DOCKER_USERNAME}/wokki-client:latest .
docker push ${DOCKER_USERNAME}/wokki-client:latest
```

## Cấu trúc

```
docker/
  Dockerfile
  docker-compose.dev.yml
  docker-compose.prod.yml   → pull image (Dokploy / VPS)
  .env.example
  README.md
```

| Service | Container | Image |
| ------- | --------- | ----- |
| Client | `wokki_client` | `${DOCKER_USERNAME}/wokki-client:latest` |

## Ghi chú

- `.dockerignore` ở **repo root** bắt buộc.
- Dev: hot reload, volume mount.
- Prod: Next.js `standalone`, healthcheck `GET /`.
