FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN DATABASE_URL="postgresql://neondb_owner:npg_iETuKPpW2we8@ep-old-snow-amakjyup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma generate
RUN DATABASE_URL="postgresql://neondb_owner:npg_iETuKPpW2we8@ep-old-snow-amakjyup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
