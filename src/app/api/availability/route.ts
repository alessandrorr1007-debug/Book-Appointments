import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { computeAvailableSlots } from '@/features/scheduling/availability-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const serviceId = searchParams.get('serviceId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const staffId = searchParams.get('staffId') || undefined;

    if (!slug || !serviceId || !dateStr) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: slug, serviceId, date' },
        { status: 400 }
      );
    }

    const business = await AppointmentRepository.getBusinessBySlug(slug);
    if (!business || !business.booking_enabled) {
      return NextResponse.json(
        { error: 'Negocio no encontrado o no acepta reservas' },
        { status: 404 }
      );
    }

    const services = await AppointmentRepository.listServices(business.id);
    const service = services.find((s) => s.id === serviceId && s.active);
    if (!service) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 404 });
    }

    const [businessHours, exceptions, existingAppointments, staffMembers] = await Promise.all([
      AppointmentRepository.listBusinessHours(business.id),
      AppointmentRepository.listExceptions(business.id),
      AppointmentRepository.listAppointments(business.id, { date: dateStr }),
      AppointmentRepository.listStaff(business.id),
    ]);

    const availability = computeAvailableSlots({
      business,
      service,
      dateStr,
      businessHours,
      exceptions,
      existingAppointments,
      staffMembers,
      selectedStaffId: staffId,
    });

    return NextResponse.json(availability);
  } catch (err: any) {
    console.error('[API Availability Error]', err);
    return NextResponse.json(
      { error: 'Error al consultar disponibilidad' },
      { status: 500 }
    );
  }
}
