#!/bin/sh

echo "🚀 Iniciando aplicación..."

# Generar el cliente Prisma con las variables de entorno
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migración de base de datos con AWS RDS
echo "📦 Aplicando migración de base de datos en AWS RDS..."
npx prisma db push --skip-generate

echo "✅ Base de datos actualizada"

# Iniciar la aplicación
echo "🎯 Iniciando servidor Next.js..."
exec node server.js