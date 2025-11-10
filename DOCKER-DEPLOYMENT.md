# 🐳 Despliegue con Docker

Este proyecto incluye configuración completa de Docker para facilitar el despliegue en cualquier servidor con Docker Engine.

## 📋 Prerrequisitos

- Docker Engine (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Al menos 2GB de RAM disponible
- Puerto 3000 y 3306 disponibles en el servidor

## 🚀 Despliegue Rápido

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd formulario-empleabilidad
```

### 2. Configurar variables de entorno (IMPORTANTE)
Antes del primer despliegue, edita el archivo `docker-compose.yml` y cambia:

```yaml
# Cambiar estas credenciales por seguridad
environment:
  MYSQL_ROOT_PASSWORD: tu-password-root-seguro
  MYSQL_PASSWORD: tu-password-usuario-seguro
  AUTH_SECRET: tu-clave-jwt-super-segura-de-al-menos-32-caracteres
```

### 3. Construir y ejecutar
```bash
# Construir e iniciar los servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Verificar que todo esté funcionando
docker-compose ps
```

### 4. Acceder a la aplicación
- **Formulario de empleabilidad**: `http://tu-servidor:3000`
- **Formulario embebido**: `http://tu-servidor:3000/embed`
- **Panel administrativo**: `http://tu-servidor:3000/admin`

## 🔐 Credenciales de Administrador

Por defecto:
- **Usuario**: admin
- **Contraseña**: admin123

⚠️ **IMPORTANTE**: Cambia estas credenciales en el archivo `src/app/api/auth/route.ts` antes del despliegue en producción.

## 🛠️ Comandos Útiles

```bash
# Detener los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ ELIMINA LA BASE DE DATOS)
docker-compose down -v

# Reconstruir solo la aplicación
docker-compose up -d --build app

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f mysql

# Ejecutar comandos dentro del contenedor
docker-compose exec app sh
docker-compose exec mysql mysql -u root -p

# Backup de la base de datos
docker-compose exec mysql mysqldump -u root -p empleabilidad_ucv > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p empleabilidad_ucv < backup.sql
```

## 📊 Estructura de Servicios

### App (Puerto 3000)
- **Imagen**: Construida desde Dockerfile local
- **Base**: Node.js 18 Alpine
- **Funciones**: Aplicación Next.js con autenticación
- **Dependencias**: MySQL

### MySQL (Puerto 3306)
- **Imagen**: mysql:8.0
- **Datos**: Persistentes en volumen `mysql_data`
- **Configuración**: Usuario dedicado para la aplicación

## 🔧 Configuración de Producción

### Variables de Entorno Recomendadas

```yaml
# En docker-compose.yml, sección app > environment:
AUTH_SECRET: "clave-super-segura-de-al-menos-32-caracteres-random"
NODE_ENV: "production"
DATABASE_URL: "mysql://usuario:password@mysql:3306/empleabilidad_ucv"
```

### Seguridad Adicional

1. **Cambiar credenciales de administrador** en `src/app/api/auth/route.ts`
2. **Usar secretos seguros** para JWT y base de datos
3. **Configurar firewall** para limitar acceso a puertos
4. **Implementar HTTPS** con proxy reverso (nginx/traefik)

### Proxy Reverso (Opcional)

Para usar con nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Solución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar que MySQL esté funcionando
docker-compose exec mysql mysqladmin ping -h localhost
```

### Error de conexión a base de datos
```bash
# Verificar que los contenedores estén en la misma red
docker network ls
docker network inspect formulario-empleabilidad_empleabilidad_network
```

### Problemas de permisos
```bash
# Reiniciar con reconstrucción
docker-compose down
docker-compose up -d --build
```

## 📈 Monitoreo

### Verificar estado de salud
```bash
# Ver estado de contenedores
docker-compose ps

# Verificar uso de recursos
docker stats

# Verificar logs de errores
docker-compose logs app | grep -i error
```

### Métricas básicas
- La aplicación expone logs estándar de Next.js
- MySQL mantiene logs internos accesibles vía `docker-compose logs mysql`
- Los volúmenes persistentes mantienen los datos entre reinicios

## 🔄 Actualizaciones

```bash
# Actualizar código y reconstruir
git pull
docker-compose down
docker-compose up -d --build

# Solo actualizar la aplicación (sin afectar BD)
docker-compose up -d --build app
```