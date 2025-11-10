# Sistema de Reservas - Servicio de Empleabilidad UCV

Un sistema web desarrollado en Next.js para gestionar las reservas de citas del servicio de empleabilidad de la Universidad Central de Venezuela.

## 🌟 Características

### Para Usuarios
- **Formulario de reserva intuitivo**: Permite a los usuarios reservar citas para orientación en empleabilidad
- **Horarios disponibles**: Visualización de horarios con límites de asistentes
- **Validación en tiempo real**: Formularios con validación de datos
- **Confirmación inmediata**: Notificación de reserva exitosa

### Para Administradores
- **Panel administrativo**: Gestión completa de horarios, expositores y reservas
- **Gestión de expositores**: Registrar y administrar especialistas en empleabilidad
- **Gestión de horarios**: Crear horarios con expositor asignado y temáticas específicas
- **Visualización de registros**: Ver todas las reservas realizadas con información detallada
- **Control de capacidad**: Gestionar límites de asistentes por horario

## 🚀 Tecnologías Utilizadas

- **Next.js 16**: Framework de React para aplicaciones web
- **TypeScript**: Tipado estático para mejor desarrollo
- **Tailwind CSS**: Framework de CSS para diseño responsive
- **Prisma**: ORM para gestión de base de datos
- **MySQL**: Base de datos relacional en AWS RDS (configurada y funcionando)
- **React Hook Form**: Manejo de formularios con validación
- **Zod**: Esquemas de validación
- **date-fns**: Manipulación de fechas

## 📋 Prerequisitos

- Node.js 18 o superior
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica):
   ```bash
   git clone <repository-url>
   cd formulario-empleabilidad
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   El archivo `.env` está configurado para usar MySQL en AWS RDS:
   ```
   DATABASE_URL="mysql://empleabilidad_user:Sp69jFYU3038@proyecto-formulario.ckiahkstouyr.us-east-1.rds.amazonaws.com/empleabilidad_ucv"
   NEXTAUTH_SECRET="employment-booking-secret-key"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="admin123"
   ```

4. **Configurar la base de datos**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Poblar la base de datos con datos de ejemplo**:
   ```bash
   npx tsx prisma/seed.ts
   ```

## 🖥️ Uso

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

## 📱 Funcionalidades del Sistema

### Página Principal (`/`)
- Formulario de reserva de citas completo
- Selección de horarios disponibles
- Campos de información personal expandidos
- Confirmación de reserva

### Formulario Embebido (`/embed`)
- **Versión optimizada para iframe**: Diseñado específicamente para ser incrustado en otras páginas web
- **Sin título propio**: El contenedor padre debe proporcionar el título y contexto
- **Width 100%**: Se ajusta completamente al contenedor padre sin restricciones
- **Campos según especificaciones UCV**:
  - Nombres y Apellidos (campo único)
  - Celular (obligatorio)
  - Correo electrónico
  - DNI
  - Campus (dropdown con 12 opciones: Ate, Callao, Chepén, Chiclayo, Chimbote, Huaraz, San Juan de Lurigancho, Los Olivos, Moyobamba, Piura, Tarapoto, Trujillo)
  - Estatus Académico (Estudiante/Egresado)
  - Nivel Académico (Pregrado/Posgrado)
  - Tema de asesoría (filtrado desde base de datos)
  - Elegir asesoría (horarios disponibles filtrados por tema)
  - **Sistema de captcha**: Validación visual para prevenir spam
- **Totalmente responsive**: Adaptado para dispositivos móviles y desktop
- **Configurado para iframe**: Headers apropiados para embebido en sitios externos

### Flujo del Formulario
1. **Datos Personales**: Nombres, celular, email, DNI
2. **Información Académica**: Campus, estatus (estudiante/egresado), nivel (pregrado/posgrado)
3. **Selección de Tema**: Elección del tema de asesoría específico
4. **Selección de Servicio**: Horario disponible filtrado por tema, que incluye expositor, fecha, hora y descripción
5. **Validación**: Sistema de captcha para confirmación
6. **Confirmación**: Reserva procesada y confirmación por email

### Temas de Asesoría Disponibles
- Técnicas de Entrevista de Trabajo
- Elaboración de CV Efectivo  
- Desarrollo de Habilidades Blandas
- Orientación en Emprendimiento
- Búsqueda Efectiva de Empleo
- Networking Profesional
- Preparación para Assessment Centers

Cada tema es dictado por diferentes especialistas en diferentes horarios, permitiendo una oferta diversificada y especializada.

### Configuración de Iframe
Para embeber el formulario en su sitio web, use el siguiente código:

```html
<iframe 
    src="http://your-domain.com/embed" 
    width="100%" 
    height="1000px"
    frameborder="0"
    style="min-height: 1000px;"
    title="Formulario de Reserva UCV">
</iframe>
```

**Ejemplo completo disponible en:** `/iframe-test.html`

### Características del Formulario Embebido
- **Width 100%**: Se ajusta completamente al contenedor padre sin restricciones de ancho
- **Sin elementos externos**: Sin títulos propios, el contenedor decide el diseño
- **Responsive**: Funciona en cualquier tamaño de pantalla
- **Sin fondos**: Diseñado específicamente para iframe sin elementos visuales externos
- **Flexible**: El aplicativo padre controla título, descripción y estilo general
- **Validación mejorada**: Mensajes claros y validación en tiempo real

### Panel Administrativo (`/admin`)
- **Gestión de Horarios**:
  - Crear nuevos horarios con expositor asignado
  - Agregar título y descripción a las sesiones
  - Activar/desactivar horarios existentes
  - Ver capacidad y disponibilidad

- **Gestión de Expositores**:
  - Registrar nuevos especialistas
  - Administrar información de contacto y especialidades
  - Activar/desactivar expositores
  - Ver biografía y experiencia
  
- **Registros de Reservas**:
  - Ver todas las reservas realizadas
  - Información detallada de cada participante
  - Estado de las reservas

## 🗄️ Estructura de la Base de Datos

### Expositor (Expositores/Especialistas)
- `id`: Identificador único
- `name`: Nombre del expositor
- `lastName`: Apellido del expositor
- `email`: Email de contacto (único)
- `phone`: Teléfono (opcional)
- `speciality`: Área de especialidad
- `bio`: Biografía o descripción profesional (opcional)
- `isActive`: Estado del expositor (activo/inactivo)

### TimeSlot (Horarios)
- `id`: Identificador único
- `date`: Fecha del horario (YYYY-MM-DD)
- `startTime`: Hora de inicio (HH:MM)
- `endTime`: Hora de finalización (HH:MM)
- `maxAttendees`: Máximo número de asistentes
- `title`: Título de la sesión (opcional)
- `description`: Descripción detallada (opcional)
- `expositorId`: Referencia al expositor asignado
- `isActive`: Estado del horario (activo/inactivo)

### Booking (Reservas)
- `id`: Identificador único
- `timeSlotId`: Referencia al horario
- `firstName`: Nombre del participante
- `lastName`: Apellido del participante
- `email`: Email de contacto
- `phone`: Teléfono (opcional)
- `document`: Documento de identidad
- `occupation`: Ocupación actual (opcional)
- `comments`: Comentarios adicionales (opcional)
- `status`: Estado de la reserva (confirmed/cancelled)

### Admin (Administradores)
- `id`: Identificador único
- `username`: Nombre de usuario
- `password`: Contraseña (en desarrollo, sin hash)
- `name`: Nombre completo

## 🔧 API Endpoints

### Públicos
- `GET /api/timeslots` - Obtener horarios disponibles
- `POST /api/bookings` - Crear nueva reserva
- `GET /api/bookings` - Obtener todas las reservas

### Administrativos
- `GET /api/admin/timeslots` - Obtener todos los horarios con información de expositores
- `POST /api/admin/timeslots` - Crear nuevo horario con expositor asignado
- `PATCH /api/admin/timeslots/[id]` - Actualizar horario
- `GET /api/admin/expositors` - Obtener todos los expositores
- `POST /api/admin/expositors` - Registrar nuevo expositor
- `PATCH /api/admin/expositors/[id]` - Actualizar expositor
- `DELETE /api/admin/expositors/[id]` - Eliminar expositor

## 🎨 Diseño y UX

- **Responsive**: Adaptado para desktop, tablet y móvil
- **Accesible**: Colores contrastantes y navegación clara
- **Intuitivo**: Flujo de usuario simple y directo
- **Profesional**: Diseño limpio apropiado para una institución educativa

## 🔐 Datos de Acceso por Defecto

- **Panel Administrativo**: `/admin`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

⚠️ **Importante**: Cambiar estas credenciales en producción

## 📈 Datos de Ejemplo

El script de seed crea automáticamente:
- 4 expositores especialistas en diferentes áreas:
  - María González (Recursos Humanos)
  - Carlos Rodríguez (Coaching Profesional)
  - Ana Martínez (Psicología Organizacional)
  - Luis Pérez (Emprendimiento)
- 14 horarios (2 por día) para los próximos 7 días con temas específicos:
  - Técnicas de Entrevista de Trabajo
  - Elaboración de CV Efectivo
  - Desarrollo de Habilidades Blandas
  - Orientación en Emprendimiento
  - Búsqueda Efectiva de Empleo
  - Networking Profesional
  - Preparación para Assessment Centers
- Horarios de mañana: 09:00-11:00 (8 cupos)
- Horarios de tarde: 14:00-16:00 (10 cupos)
- Usuario administrador por defecto

## 🚀 Deploy en Producción

1. Configurar variables de entorno apropiadas
2. Usar una base de datos robusta (PostgreSQL recomendada)
3. Implementar autenticación segura para el panel admin
4. Configurar HTTPS
5. Implementar backup de base de datos

## 🤝 Contribución

Este proyecto está desarrollado para el Servicio de Empleabilidad de la UCV. Para contribuciones:

1. Fork el proyecto
2. Crear una rama para la funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📝 Licencia

Este proyecto es desarrollado para la Universidad Central de Venezuela.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo del Servicio de Empleabilidad UCV.
