import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug requerido' }, { status: 400 });
    }

    const business = await AppointmentRepository.getBusinessBySlug(slug);
    if (!business || !business.booking_enabled) {
      return NextResponse.json(
        { error: 'Negocio no encontrado o no acepta reservas' },
        { status: 404 }
      );
    }

    const [services, staff] = await Promise.all([
      AppointmentRepository.listServices(business.id, true),
      AppointmentRepository.listStaff(business.id),
    ]);

    // Ocultar datos privados y exponer solo información pública autorizada
    const publicBusiness = {
      id: business.id,
      name: business.name,
      slug: business.slug,
      business_type: business.business_type,
      description: business.description,
      phone: business.phone,
      address: business.address,
      timezone: business.timezone,
      min_booking_notice_hours: business.min_booking_notice_hours,
      max_booking_advance_days: business.max_booking_advance_days,
      cancellation_notice_hours: business.cancellation_notice_hours,
      booking_enabled: business.booking_enabled,
    };

    return NextResponse.json({
      business: publicBusiness,
      services,
      staff,
    });
  } catch (err: any) {
    console.error('[API Public Business Error]', err);
    return NextResponse.json(
      { error: 'Error al consultar datos públicos del negocio' },
      { status: 500 }
    );
  }
}
