import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { publicBookingSchema } from '@/lib/validations';
import { NotificationService } from '@/features/notifications/notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validación Zod de entrada
    const parseResult = publicBookingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Datos de reserva inválidos',
        },
        { status: 400 }
      );
    }

    const {
      businessSlug,
      serviceId,
      staffMemberId,
      startAtIso,
      customerName,
      customerEmail,
      customerPhone,
      internalNotes,
    } = parseResult.data;

    // 2. Ejecutar creación atómica anti-colisión
    const result = await AppointmentRepository.createAppointmentAtomic({
      businessSlug,
      serviceId,
      staffMemberId,
      startAtIso,
      customerName,
      customerEmail,
      customerPhone,
      internalNotes,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    // 3. Envío asíncrono no bloqueante de notificación
    if (customerEmail && result.appointmentId) {
      (async () => {
        try {
          const [business, service, appointment] = await Promise.all([
            AppointmentRepository.getBusinessBySlug(businessSlug),
            AppointmentRepository.listServices(businessSlug).then((s) => s.find((x) => x.id === serviceId)),
            AppointmentRepository.getAppointmentById(result.appointmentId!),
          ]);

          if (business && service && appointment) {
            const emailPayload = NotificationService.generateBookingConfirmationTemplate({
              appointment,
              business,
              service,
            });
            await NotificationService.sendEmail(emailPayload);
          }
        } catch (e) {
          console.error('[Async Notification Error]', e);
        }
      })();
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('[API Booking Error]', err);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error inesperado al procesar la reserva.' },
      { status: 500 }
    );
  }
}
