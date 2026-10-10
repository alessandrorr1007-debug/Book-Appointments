import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/lib/supabase/repository';
import { staffMemberSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const staff = await AppointmentRepository.listStaff(business.id);
    return NextResponse.json({ staff });
  } catch (err: any) {
    console.error('[API Admin Staff GET Error]', err);
    return NextResponse.json({ error: 'Error al listar personal' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = staffMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos de personal inválidos' },
        { status: 400 }
      );
    }

    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const { mockDb } = await import('@/lib/supabase/mock-db');
    const newMember = await mockDb.createStaff({
      business_id: business.id,
      display_name: parsed.data.displayName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      active: parsed.data.active,
    });

    return NextResponse.json({ staff: newMember }, { status: 201 });
  } catch (err: any) {
    console.error('[API Admin Staff POST Error]', err);
    return NextResponse.json({ error: 'Error al crear miembro' }, { status: 500 });
  }
}
