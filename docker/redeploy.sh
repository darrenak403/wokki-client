#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE=(docker compose -f docker/docker-compose.prod.yml --env-file docker/.env)

# `pull_policy: always` alone is not enough to guarantee a fresh image: the
# Docker daemon (and some registry mirrors/CDNs) can serve a cached manifest
# for a mutable tag like `latest`, so `docker compose pull` silently reports
# "Image is up to date" even after a new image was pushed. Dropping the local
# tag first forces a real manifest re-fetch instead of a conditional check.
IMAGE="$("${COMPOSE[@]}" config --images | head -n1)"
docker rmi "$IMAGE" >/dev/null 2>&1 || true

"${COMPOSE[@]}" pull
"${COMPOSE[@]}" up -d --remove-orphans
