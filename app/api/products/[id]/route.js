import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

export async function DELETE(_request, { params }) {
  const { id } = params || {};
  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true, id });
}
