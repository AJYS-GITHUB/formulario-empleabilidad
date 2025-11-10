import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';

const expositorSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un email válido'),
  phone: z.string().optional(),
  speciality: z.string().min(2, 'La especialidad es requerida'),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const expositors = await prisma.expositor.findMany({
      orderBy: [
        { lastName: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(expositors);
  } catch (error) {
    console.error('Error fetching expositors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = expositorSchema.parse(body);

    // Check if email already exists
    const existingExpositor = await prisma.expositor.findUnique({
      where: { email: validatedData.email }
    });

    if (existingExpositor) {
      return NextResponse.json({ 
        error: 'Ya existe un expositor con este email' 
      }, { status: 400 });
    }

    const expositor = await prisma.expositor.create({
      data: validatedData,
    });

    return NextResponse.json(expositor);
  } catch (error) {
    console.error('Error creating expositor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}