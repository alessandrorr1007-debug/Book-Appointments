import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/supabase/mock-db';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};
    if (body.displayName !== undefined) updateData.display_name = body.displayName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.active !== undefined) updateData.active = body.active;

    const updated = await mockDb.updateStaff(id, updateData);
    return NextResponse.json({ staff: updated });
  } catch (err: any) {
    console.error('[API Admin Staff PUT Error]', err);
    return NextResponse.json({ error: 'Error al actualizar personal' }, { status: 500 });
  }
}
