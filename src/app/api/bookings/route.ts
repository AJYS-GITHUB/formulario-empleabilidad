import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const bookingSchema = z.object({
  timeSlotId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  document: z.string(),
  campus: z.string(),
  academicStatus: z.string().optional(),
  academicLevel: z.string().optional(),
  advisoryTopic: z.string().optional(),
  advisoryType: z.string().optional(),
  serviceOption: z.string().optional(),
  occupation: z.string().optional(),
  comments: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    // Check if time slot exists and has capacity
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: validatedData.timeSlotId },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'confirmed' }
            }
          }
        }
      }
    });

    if (!timeSlot) {
      return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 });
    }

    if (!timeSlot.isActive) {
      return NextResponse.json({ error: 'Horario no disponible' }, { status: 400 });
    }

    if (timeSlot._count.bookings >= timeSlot.maxAttendees) {
      return NextResponse.json({ error: 'No hay cupos disponibles' }, { status: 400 });
    }

    // Check for duplicate booking (same email and time slot)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        email: validatedData.email,
        timeSlotId: validatedData.timeSlotId,
        status: 'confirmed'
      }
    });

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'Ya tiene una reserva confirmada para este horario' 
      }, { status: 400 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: validatedData,
      include: {
        timeSlot: true
      }
    });

    return NextResponse.json({ 
      message: 'Reserva creada exitosamente',
      booking: {
        id: booking.id,
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        timeSlot: {
          date: booking.timeSlot.date,
          startTime: booking.timeSlot.startTime,
          endTime: booking.timeSlot.endTime
        }
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        timeSlot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}