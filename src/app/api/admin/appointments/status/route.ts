import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, status, notes } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'appointmentId y status requeridos' }, { status: 400 });
    }

    const updated = await AppointmentRepository.updateAppointmentStatus(appointmentId, status, notes);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    console.error('[API Status Update Error]', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar estado' }, { status: 500 });
  }
}
