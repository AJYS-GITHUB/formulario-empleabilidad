# Migración a MySQL para el Sistema de Empleabilidad

## 📋 Cambios Implementados

### ✅ Sistema Actualizado Incluye:

1. **Modelo de Expositores**: Cada horario ahora tiene un expositor asignado
2. **Información Enriquecida**: Títulos y descripciones para cada sesión
3. **Gestión Completa**: Panel admin para manejar expositores y horarios
4. **Datos de Ejemplo**: 4 expositores especialistas con horarios temáticos

### 🔄 Para Migrar a MySQL:

## Opción 1: MySQL Local (Recomendado para desarrollo)

### Instalar MySQL en el sistema:

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server mysql-client
```

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Windows:
Descargar e instalar desde: https://dev.mysql.com/downloads/mysql/

### Configurar MySQL:

1. **Ejecutar configuración segura:**
```bash
sudo mysql_secure_installation
```

2. **Crear base de datos y usuario:**
```sql
-- Conectarse como root
mysql -u root -p

-- Crear base de datos
CREATE DATABASE empleabilidad_ucv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'empleabilidad_user'@'localhost' IDENTIFIED BY 'empleabilidad_2025';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON empleabilidad_ucv.* TO 'empleabilidad_user'@'localhost';
FLUSH PRIVILEGES;

-- Salir
EXIT;
```

3. **Actualizar .env:**
```env
# Comentar SQLite
# DATABASE_URL="file:./dev.db"

# Descomentar MySQL
DATABASE_URL="mysql://empleabilidad_user:empleabilidad_2025@localhost:3306/empleabilidad_ucv"
```

4. **Actualizar prisma/schema.prisma:**
```prisma
datasource db {
  provider = "mysql"  // Cambiar de "sqlite" a "mysql"
  url      = env("DATABASE_URL")
}
```

5. **Agregar restricciones MySQL al schema:**
```prisma
model Expositor {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  lastName    String   @db.VarChar(255)
  email       String   @unique @db.VarChar(255)
  phone       String?  @db.VarChar(20)
  speciality  String   @db.VarChar(255)
  bio         String?  @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  timeSlots   TimeSlot[]
}

model TimeSlot {
  id            String     @id @default(cuid())
  date          String     @db.VarChar(10)
  startTime     String     @db.VarChar(5)
  endTime       String     @db.VarChar(5)
  maxAttendees  Int        @default(10)
  title         String?    @db.VarChar(255)
  description   String?    @db.Text
  isActive      Boolean    @default(true)
  expositorId   Int
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  expositor     Expositor  @relation(fields: [expositorId], references: [id])
  bookings      Booking[]

  @@index([date, startTime])
  @@index([expositorId])
}

// ... resto de modelos con restricciones MySQL
```

6. **Ejecutar migración:**
```bash
# Generar cliente
npx prisma generate

# Crear migración inicial para MySQL
npx prisma migrate dev --name init-mysql

# Poblar con datos
npx tsx prisma/seed.ts
```

## Opción 2: MySQL con Docker (Rápido para desarrollo)

1. **Usar docker-compose.yml incluido:**
```bash
docker-compose up -d
```

2. **Esperar a que MySQL esté listo:**
```bash
# Verificar que el contenedor esté corriendo
docker ps

# Ver logs
docker-compose logs mysql
```

3. **Seguir pasos 3-6 de la Opción 1**

## Opción 3: MySQL en la Nube (Para producción)

### PlanetScale (Recomendado):
1. Crear cuenta en https://planetscale.com
2. Crear nueva base de datos
3. Obtener string de conexión
4. Usar en .env:
```env
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?sslaccept=strict"
```

### Amazon RDS:
1. Crear instancia MySQL en AWS RDS
2. Configurar security groups
3. Usar string de conexión:
```env
DATABASE_URL="mysql://username:password@endpoint.region.rds.amazonaws.com:3306/database_name"
```

## 🔧 Verificaciones Post-Migración:

1. **Probar conexión:**
```bash
npx prisma studio
```

2. **Verificar datos:**
```bash
# Contar registros
npx prisma db execute --stdin <<< "SELECT 
  (SELECT COUNT(*) FROM Expositor) as expositores,
  (SELECT COUNT(*) FROM TimeSlot) as horarios,
  (SELECT COUNT(*) FROM Booking) as reservas;"
```

3. **Probar aplicación:**
```bash
npm run dev
```
- Ir a http://localhost:3000
- Probar reserva de cita
- Ir a http://localhost:3000/admin
- Verificar gestión de expositores y horarios

## ⚠️ Notas Importantes:

- **Backup**: Siempre respaldar datos antes de migrar
- **Conexiones**: MySQL requiere más configuración de red que SQLite
- **Performance**: MySQL ofrece mejor rendimiento para múltiples usuarios
- **Producción**: Cambiar credenciales por defecto en producción
- **SSL**: Configurar SSL para conexiones en producción

## 🆘 Troubleshooting:

### Error de conexión:
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql
```

### Error de permisos:
```sql
-- Otorgar todos los permisos
GRANT ALL PRIVILEGES ON *.* TO 'empleabilidad_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error de caracteres:
```sql
-- Verificar charset de la base de datos
SHOW CREATE DATABASE empleabilidad_ucv;

-- Cambiar charset si es necesario
ALTER DATABASE empleabilidad_ucv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```