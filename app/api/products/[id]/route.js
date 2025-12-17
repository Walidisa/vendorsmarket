import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

const getParams = async (paramsOrPromise) => {
  try {
    return await paramsOrPromise;
  } catch {
    return {};
  }
};

const getProductId = (request, params, body) => {
  if (params?.id) return params.id;
  const bodyId = body?.id || body?.product_id || body?.productId;
  if (bodyId) return bodyId;
  try {
    const { searchParams, pathname } = new URL(request.url);
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== 'products') return last;
  } catch (_) {
    // ignore parsing issues
  }
  return null;
};

export async function DELETE(request, context) {
  const params = await getParams(context?.params);
  const id = getProductId(request, params);
  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true, id });
}

export async function PUT(request, context) {
  const body = await request.json().catch(() => null);
  const params = await getParams(context?.params);
  const id = getProductId(request, params, body);
  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }

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
