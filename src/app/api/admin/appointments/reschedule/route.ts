import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { rescheduleBookingSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = rescheduleBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { appointmentId, newStartAtIso, staffMemberId } = parsed.data;

    const updated = await AppointmentRepository.rescheduleAppointment(
      appointmentId,
      newStartAtIso,
      staffMemberId
    );

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    console.error('[API Reschedule Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error al reprogramar la cita' },
      { status: 409 }
    );
  }
}
