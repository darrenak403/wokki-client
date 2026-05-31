# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat

# --- Development: hot reload ---
FROM base AS dev
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
EXPOSE 6789
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "6789"]

# --- Production: dependencies (include dev — Tailwind/PostCSS needed at build) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# --- Production: build ---
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production: run ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=6789 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S wokki \
    && adduser -S wokki -G wokki -u 10001

COPY --from=builder --chown=wokki:wokki /app/public ./public
COPY --from=builder --chown=wokki:wokki /app/.next/standalone ./
COPY --from=builder --chown=wokki:wokki /app/.next/static ./.next/static
COPY --chown=wokki:wokki docker/entrypoint.js ./entrypoint.js

USER wokki
EXPOSE 6789

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:6789/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "entrypoint.js"]
