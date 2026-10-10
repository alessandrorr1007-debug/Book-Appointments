import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { businessSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (err: any) {
    console.error('[API Admin Settings GET Error]', err);
    return NextResponse.json({ error: 'Error al consultar configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const updated = await AppointmentRepository.updateBusiness(business.id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      phone: body.phone,
      email: body.email,
      address: body.address,
      timezone: body.timezone,
      min_booking_notice_hours: body.minBookingNoticeHours,
      max_booking_advance_days: body.maxBookingAdvanceDays,
      cancellation_notice_hours: body.cancellationNoticeHours,
      booking_enabled: body.bookingEnabled,
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    console.error('[API Admin Settings POST Error]', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar configuración' }, { status: 500 });
  }
}
