import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const timeSlot = await prisma.timeSlot.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Error updating time slot:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}