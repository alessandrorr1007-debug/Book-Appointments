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

    const customers = await AppointmentRepository.listCustomers(business.id);
    return NextResponse.json({ customers });
  } catch (err: any) {
    console.error('[API Admin Customers GET Error]', err);
    return NextResponse.json({ error: 'Error al listar clientes' }, { status: 500 });
  }
}
