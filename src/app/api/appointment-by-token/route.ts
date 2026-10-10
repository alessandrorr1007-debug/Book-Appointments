import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const appointment = await AppointmentRepository.getAppointmentByToken(token);
    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (err: any) {
    console.error('[API Appointment By Token Error]', err);
    return NextResponse.json({ error: 'Error al consultar cita' }, { status: 500 });
  }
}
