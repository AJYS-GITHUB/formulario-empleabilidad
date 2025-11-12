import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';

const timeSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxAttendees: z.number().min(1).max(50),
  title: z.string().optional(),
  description: z.string().optional(),
  expositorId: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const showPast = searchParams.get('showPast') === 'true';
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Obtener fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Construir filtro de fecha
    const dateFilter = showPast ? {} : {
      date: {
        gte: today
      }
    };

    // Obtener total de registros para paginación
    const totalCount = await prisma.timeSlot.count({
      where: dateFilter
    });

    const timeSlots = await prisma.timeSlot.findMany({
      where: dateFilter,
      include: {
        expositor: {
          select: {
            id: true,
            name: true,
            lastName: true,
            speciality: true,
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'confirmed'
              }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      skip: offset,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      timeSlots,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = timeSlotSchema.parse(body);

    // Check if the end time is after start time
    if (validatedData.startTime >= validatedData.endTime) {
      return NextResponse.json({ 
        error: 'La hora de fin debe ser posterior a la hora de inicio' 
      }, { status: 400 });
    }

    // Check if expositor exists
    const expositor = await prisma.expositor.findUnique({
      where: { id: validatedData.expositorId }
    });

    if (!expositor) {
      return NextResponse.json({ 
        error: 'El expositor seleccionado no existe' 
      }, { status: 400 });
    }

    // Permitir múltiples charlas simultáneas (validación de solapamiento eliminada)

    const timeSlot = await prisma.timeSlot.create({
      data: validatedData,
      include: {
        expositor: {
          select: {
            id: true,
            name: true,
            lastName: true,
            speciality: true,
          }
        }
      }
    });

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error creating time slot:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}