import { PrismaClient } from '@prisma/client';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos de ejemplo...');

  // Create sample expositors first
  const expositors = [
    {
      name: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@ucv.ve',
      phone: '+58 414 1234567',
      speciality: 'Recursos Humanos',
      bio: 'Especialista en reclutamiento y selección de personal con más de 10 años de experiencia en empresas multinacionales.',
      isActive: true,
    },
    {
      name: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@ucv.ve',
      phone: '+58 424 9876543',
      speciality: 'Coaching Profesional',
      bio: 'Coach certificado en desarrollo de carrera y liderazgo. Experto en técnicas de entrevista y negociación salarial.',
      isActive: true,
    },
    {
      name: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@ucv.ve',
      phone: '+58 412 5555555',
      speciality: 'Psicología Organizacional',
      bio: 'Psicóloga organizacional especializada en orientación vocacional y desarrollo de habilidades blandas.',
      isActive: true,
    },
    {
      name: 'Luis',
      lastName: 'Pérez',
      email: 'luis.perez@ucv.ve',
      speciality: 'Emprendimiento',
      bio: 'Empresario y consultor en desarrollo de startups. Mentor de programas de incubación de empresas.',
      isActive: true,
    },
  ];

  // Create expositors and store their IDs
  const createdExpositors = [];
  for (const expositor of expositors) {
    const created = await prisma.expositor.create({ data: expositor });
    createdExpositors.push(created);
  }

  // Create sample time slots for the next week with expositors
  const timeSlots = [];
  const today = new Date();
  
  const topics = [
    { title: 'Técnicas de Entrevista de Trabajo', description: 'Aprende a destacar en entrevistas laborales y causar una excelente primera impresión.' },
    { title: 'Elaboración de CV Efectivo', description: 'Crea un currículum que llame la atención de los reclutadores.' },
    { title: 'Desarrollo de Habilidades Blandas', description: 'Fortalece competencias como liderazgo, comunicación y trabajo en equipo.' },
    { title: 'Orientación en Emprendimiento', description: 'Descubre cómo desarrollar tu idea de negocio y convertirla en realidad.' },
    { title: 'Búsqueda Efectiva de Empleo', description: 'Estrategias y canales para encontrar oportunidades laborales.' },
    { title: 'Networking Profesional', description: 'Construye una red de contactos que impulse tu carrera profesional.' },
    { title: 'Preparación para Assessment Centers', description: 'Domina las dinámicas grupales y pruebas de evaluación.' },
  ];
  
  for (let i = 1; i <= 7; i++) {
    const date = addDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Morning slot
    const morningTopic = topics[(i - 1) % topics.length];
    const morningExpositor = createdExpositors[(i - 1) % createdExpositors.length];
    
    timeSlots.push({
      date: dateString,
      startTime: '09:00',
      endTime: '11:00',
      maxAttendees: 8,
      title: morningTopic.title,
      description: morningTopic.description,
      expositorId: morningExpositor.id,
      isActive: true,
    });
    
    // Afternoon slot
    const afternoonTopic = topics[i % topics.length];
    const afternoonExpositor = createdExpositors[i % createdExpositors.length];
    
    timeSlots.push({
      date: dateString,
      startTime: '14:00',
      endTime: '16:00',
      maxAttendees: 10,
      title: afternoonTopic.title,
      description: afternoonTopic.description,
      expositorId: afternoonExpositor.id,
      isActive: true,
    });
  }

  // Create the time slots
  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot });
  }

  // Create admin user
  await prisma.admin.create({
    data: {
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      name: 'Administrador del Sistema',
    },
  });

  console.log('✅ Datos de ejemplo creados exitosamente');
  console.log(`👥 Creados ${expositors.length} expositores`);
  console.log(`📅 Creados ${timeSlots.length} horarios para los próximos 7 días`);
  console.log('👤 Usuario admin creado (username: admin, password: admin123)');
}

main()
  .catch((e) => {
    console.error('❌ Error creando datos de ejemplo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });