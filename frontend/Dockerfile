FROM node:24-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS prod-deps

ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

FROM node:24-alpine AS builder

WORKDIR /app
ARG NEXT_PUBLIC_RAILS_ASSET_HOSTS=""
ENV NEXT_PUBLIC_RAILS_ASSET_HOSTS=$NEXT_PUBLIC_RAILS_ASSET_HOSTS
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/next.config.ts ./next.config.ts

USER node

EXPOSE 3001
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3001"]
