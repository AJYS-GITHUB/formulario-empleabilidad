#!/bin/sh

echo "🚀 Iniciando aplicación..."
echo "DATABASE_URL: $DATABASE_URL"

# Verificar si las variables están cargadas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    exit 1
fi

echo "🔧 Regenerando cliente Prisma..."
npx prisma generate

echo "📦 Verificando conexión a base de datos..."
npx prisma db push --skip-generate --accept-data-loss || {
    echo "❌ Error conectando a la base de datos"
    exit 1
}

echo "✅ Base de datos conectada correctamente"

# Verificar que el servidor standalone existe
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ ERROR: No se encuentra .next/standalone/server.js"
    echo "Contenido de .next:"
    ls -la .next/ || echo "Directorio .next no existe"
    exit 1
fi

# Verificar archivos estáticos
echo "📁 Verificando archivos estáticos..."
if [ ! -d ".next/standalone/public" ]; then
    echo "⚠️  Creando directorio public..."
    mkdir -p .next/standalone/public
    if [ -d "public" ]; then
        cp -r public/* .next/standalone/public/ 2>/dev/null || true
        echo "✅ Archivos public copiados"
    fi
fi

if [ ! -d ".next/standalone/.next/static" ]; then
    echo "⚠️  Creando directorio static..."
    mkdir -p .next/standalone/.next/static
    if [ -d ".next/static" ]; then
        cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true
        echo "✅ Archivos static copiados"
    fi
fi

echo "📁 Estructura de archivos:"
echo "Public files:"
ls -la .next/standalone/public/ 2>/dev/null || echo "Sin archivos public"
echo "Static files:"
ls -la .next/standalone/.next/static/ 2>/dev/null || echo "Sin archivos static"

echo "🎯 Iniciando servidor Next.js..."
cd .next/standalone
exec node server.js