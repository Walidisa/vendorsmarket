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

export async function PUT(request, { params }) {
  const { id } = params || {};
  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const update = {
    name: body.name,
    price: body.price,
    main_category: body.main_category || body.mainCategory,
    subcategory: body.subcategory || body.subCategory,
    cover_image: body.cover_image || body.coverImage,
    images: Array.isArray(body.images) ? body.images : [],
    description: body.description,
    user_id: body.user_id || body.userId || null,
  };

  if (body.vendor_username || body.vendorUsername) {
    update.vendor_username = body.vendor_username || body.vendorUsername;
  }

  const { data, error } = await supabaseServer
    .from('products')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
