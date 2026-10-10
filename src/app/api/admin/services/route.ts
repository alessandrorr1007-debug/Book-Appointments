import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { serviceSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const services = await AppointmentRepository.listServices(business.id);
    return NextResponse.json({ services });
  } catch (err: any) {
    console.error('[API Admin Services GET Error]', err);
    return NextResponse.json({ error: 'Error al listar servicios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos de servicio inválidos' },
        { status: 400 }
      );
    }

    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const newService = await AppointmentRepository.createService({
      business_id: business.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      duration_minutes: parsed.data.durationMinutes,
      buffer_before_minutes: parsed.data.bufferBeforeMinutes,
      buffer_after_minutes: parsed.data.bufferAfterMinutes,
      price_amount: parsed.data.priceAmount || null,
      currency: parsed.data.currency,
      active: parsed.data.active,
    });

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (err: any) {
    console.error('[API Admin Services POST Error]', err);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}
