import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.durationMinutes !== undefined) updateData.duration_minutes = body.durationMinutes;
    if (body.bufferBeforeMinutes !== undefined) updateData.buffer_before_minutes = body.bufferBeforeMinutes;
    if (body.bufferAfterMinutes !== undefined) updateData.buffer_after_minutes = body.bufferAfterMinutes;
    if (body.priceAmount !== undefined) updateData.price_amount = body.priceAmount;
    if (body.active !== undefined) updateData.active = body.active;

    const updated = await AppointmentRepository.updateService(id, updateData);
    return NextResponse.json({ service: updated });
  } catch (err: any) {
    console.error('[API Admin Services PUT Error]', err);
    return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await AppointmentRepository.deleteService(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error('[API Admin Services DELETE Error]', err);
    return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 });
  }
}
