# Studio Compliance Manager - Production Dockerfile
# Multi-stage build per ottimizzare dimensioni immagine

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copia solo i file di dipendenze
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Installa dipendenze (incluso Prisma)
RUN npm ci --legacy-peer-deps && \
    npx prisma generate

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copia dipendenze dallo stage precedente
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build variabili d'ambiente (placeholder, verranno sovrascritte)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build dell'applicazione Next.js
RUN npm run build

# ============================================
# Stage 3: Runner (Immagine finale)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Variabili d'ambiente di produzione
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crea utente non-root per sicurezza
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copia file necessari dal builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/scripts ./scripts

# Installa netcat per health check database
RUN apk add --no-cache netcat-openbsd

# Crea directory per uploads e logs
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nextjs:nodejs /app/uploads /app/logs && \
    chmod +x /app/scripts/*.sh

# Cambia utente
USER nextjs

# Esponi porta
EXPOSE 3000

# Variabili d'ambiente runtime
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Startup script
CMD ["sh", "/app/scripts/docker-entrypoint.sh"]
