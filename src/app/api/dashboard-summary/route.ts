import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const [metrics, recentAppointments] = await Promise.all([
      AppointmentRepository.getDashboardMetrics(business.id),
      AppointmentRepository.listAppointments(business.id),
    ]);

    return NextResponse.json({
      metrics,
      recentAppointments: recentAppointments.slice(0, 10),
    });
  } catch (err: any) {
    console.error('[API Dashboard Summary Error]', err);
    return NextResponse.json({ error: 'Error al consultar métricas' }, { status: 500 });
  }
}
