import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  speciality: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const expositorId = parseInt(params.id);
    
    if (isNaN(expositorId)) {
      return NextResponse.json({ error: 'ID de expositor inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    // Check if email already exists (if changing email)
    if (validatedData.email) {
      const existingExpositor = await prisma.expositor.findFirst({
        where: { 
          email: validatedData.email,
          NOT: { id: expositorId }
        }
      });

      if (existingExpositor) {
        return NextResponse.json({ 
          error: 'Ya existe un expositor con este email' 
        }, { status: 400 });
      }
    }

    const expositor = await prisma.expositor.update({
      where: { id: expositorId },
      data: validatedData,
    });

    return NextResponse.json(expositor);
  } catch (error) {
    console.error('Error updating expositor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const expositorId = parseInt(params.id);
    
    if (isNaN(expositorId)) {
      return NextResponse.json({ error: 'ID de expositor inválido' }, { status: 400 });
    }

    // Check if expositor has active time slots
    const activeTimeSlots = await prisma.timeSlot.findFirst({
      where: {
        expositorId: expositorId,
        isActive: true
      }
    });

    if (activeTimeSlots) {
      return NextResponse.json({ 
        error: 'No se puede eliminar un expositor con horarios activos' 
      }, { status: 400 });
    }

    await prisma.expositor.delete({
      where: { id: expositorId }
    });

    return NextResponse.json({ message: 'Expositor eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting expositor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}