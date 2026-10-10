import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { cancelBookingSchema } from '@/lib/validations';
import { NotificationService } from '@/features/notifications/notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { cancellationToken, reason } = parsed.data;

    const appointment = await AppointmentRepository.getAppointmentByToken(cancellationToken);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Cita no encontrada o enlace inválido.' },
        { status: 404 }
      );
    }

    const result = await AppointmentRepository.cancelAppointmentByToken(cancellationToken, reason);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Enviar notificación de cancelación si tenía email
    if (appointment.customer_email_snapshot && appointment.business) {
      (async () => {
        try {
          const emailPayload = NotificationService.generateCancellationTemplate({
            appointment,
            business: appointment.business!,
            reason,
          });
          await NotificationService.sendEmail(emailPayload);
        } catch (e) {
          console.error('[Async Cancellation Email Error]', e);
        }
      })();
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API Cancel Error]', err);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la cancelación.' },
      { status: 500 }
    );
  }
}
