import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { mockDb } from '@/lib/supabase/mock-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const hours = await AppointmentRepository.listBusinessHours(business.id);
    return NextResponse.json({ hours });
  } catch (err: any) {
    console.error('[API Admin Hours GET Error]', err);
    return NextResponse.json({ error: 'Error al consultar horarios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { hours } = body;

    const updated = await mockDb.updateBusinessHours(
      business.id,
      hours.map((h: any) => ({
        business_id: business.id,
        staff_member_id: null,
        day_of_week: h.dayOfWeek,
        start_time: h.startTime,
        end_time: h.endTime,
      }))
    );

    return NextResponse.json({ success: true, hours: updated });
  } catch (err: any) {
    console.error('[API Admin Hours POST Error]', err);
    return NextResponse.json({ error: 'Error al guardar horarios' }, { status: 500 });
  }
}
