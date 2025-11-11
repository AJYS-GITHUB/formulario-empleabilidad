# Dockerfile optimizado para Prisma
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma con URL dummy y construir
ENV DATABASE_URL="mysql://dummy:dummy@dummy:3306/dummy"
RUN npx prisma generate && npm run build

# Instalar solo dependencias de producción en directorio limpio
RUN rm -rf node_modules && npm ci --only=production

# Configurar usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configurar archivos y permisos
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

# Configurar variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER nextjs
EXPOSE 3000

CMD ["./start.sh"]