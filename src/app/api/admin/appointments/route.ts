import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const date = searchParams.get('date') || undefined;

    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const appointments = await AppointmentRepository.listAppointments(business.id, {
      status,
      search,
      date,
    });

    return NextResponse.json({ appointments });
  } catch (err: any) {
    console.error('[API Admin Appointments Error]', err);
    return NextResponse.json({ error: 'Error al listar citas' }, { status: 500 });
  }
}
