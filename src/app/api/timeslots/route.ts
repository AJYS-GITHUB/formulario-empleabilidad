import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type TimeSlotWithExpositor = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  title: string | null;
  description: string | null;
  expositor: {
    id: number;
    name: string;
    lastName: string;
    speciality: string;
    bio: string | null;
  };
  _count: {
    bookings: number;
  };
};

export async function GET() {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        isActive: true,
      },
      include: {
        expositor: {
          select: {
            id: true,
            name: true,
            lastName: true,
            speciality: true,
            bio: true,
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

    const availableSlots = timeSlots.map((slot: TimeSlotWithExpositor) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxAttendees: slot.maxAttendees,
      title: slot.title,
      description: slot.description,
      currentBookings: slot._count.bookings,
      expositor: {
        name: `${slot.expositor.name} ${slot.expositor.lastName}`,
        speciality: slot.expositor.speciality,
        bio: slot.expositor.bio,
      }
    }));

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}