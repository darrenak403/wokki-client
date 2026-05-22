# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# --- Development: hot reload ---
FROM base AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 6789
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "6789"]

# --- Production: install dependencies ---
FROM base AS deps
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci

# --- Production: build ---
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_ENV=production

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV

RUN npm run build

# --- Production: run ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=6789
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache wget \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 6789
CMD ["node", "server.js"]
