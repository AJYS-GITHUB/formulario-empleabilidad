# Dockerfile optimizado para Prisma
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Generar Prisma y construir con URL dummy
ENV DATABASE_URL="mysql://dummy:dummy@dummy:3306/dummy"
RUN npx prisma generate
RUN npm run build

# Crear estructura de directorios para standalone
RUN mkdir -p /app/.next/standalone/public
RUN mkdir -p /app/.next/standalone/.next/static

# Copiar archivos estáticos necesarios para standalone
RUN cp -r /app/public/* /app/.next/standalone/public/ 2>/dev/null || true
RUN cp -r /app/.next/static/* /app/.next/standalone/.next/static/ 2>/dev/null || true

# Limpiar e instalar solo dependencias de producción
RUN rm -rf node_modules
RUN npm ci --only=production

# Configurar usuario
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
RUN chmod +x start.sh

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

USER nextjs
EXPOSE 3000

CMD ["./start.sh"]