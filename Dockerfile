FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

# pg and its deps needed by migrate.mjs (standalone doesn't auto-trace scripts/)
COPY --from=deps /app/node_modules/pg /app/node_modules/pg
COPY --from=deps /app/node_modules/pg-cloudflare /app/node_modules/pg-cloudflare
COPY --from=deps /app/node_modules/pg-connection-string /app/node_modules/pg-connection-string
COPY --from=deps /app/node_modules/pg-int8 /app/node_modules/pg-int8
COPY --from=deps /app/node_modules/pg-pool /app/node_modules/pg-pool
COPY --from=deps /app/node_modules/pg-protocol /app/node_modules/pg-protocol
COPY --from=deps /app/node_modules/pg-types /app/node_modules/pg-types
COPY --from=deps /app/node_modules/pgpass /app/node_modules/pgpass
COPY --from=deps /app/node_modules/postgres-array /app/node_modules/postgres-array
COPY --from=deps /app/node_modules/postgres-bytea /app/node_modules/postgres-bytea
COPY --from=deps /app/node_modules/postgres-date /app/node_modules/postgres-date
COPY --from=deps /app/node_modules/postgres-interval /app/node_modules/postgres-interval

USER nextjs
EXPOSE 8080

CMD node scripts/migrate.mjs && node server.js
