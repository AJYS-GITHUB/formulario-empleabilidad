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

export async function GET() {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
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
      ]
    });

    return NextResponse.json(timeSlots);
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

    // Check if there's already a time slot for the same date and time
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        date: validatedData.date,
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } }
            ]
          }
        ]
      }
    });

    if (existingSlot) {
      return NextResponse.json({ 
        error: 'Ya existe un horario que se solapa con el horario especificado' 
      }, { status: 400 });
    }

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