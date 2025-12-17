import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const productId = body?.product_id || body?.productId;
  const rating = Number(body?.rating) || 0;

  if (!productId || !rating) {
    return NextResponse.json({ error: 'product_id and rating are required.' }, { status: 400 });
  }

  const { data: product, error: selectError } = await supabaseServer
    .from('products')
    .select('rating_value, rating_count')
    .eq('id', productId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const currentValue = Number(product.rating_value) || 0;
  const currentCount = Number(product.rating_count) || 0;
  const total = currentValue * currentCount + rating;
  const newCount = currentCount + 1;
  const newValue = total / newCount;

  const { error: updateError } = await supabaseServer
    .from('products')
    .update({ rating_value: newValue, rating_count: newCount })
    .eq('id', productId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    rating_value: newValue,
    rating_count: newCount,
  });
}

export async function DELETE(request) {
  const body = await request.json().catch(() => null);
  const productId = body?.product_id || body?.productId;
  const rating = Number(body?.rating) || 0;

  if (!productId || !rating) {
    return NextResponse.json({ error: 'product_id and rating are required.' }, { status: 400 });
  }

  const { data: product, error: selectError } = await supabaseServer
    .from('products')
    .select('rating_value, rating_count')
    .eq('id', productId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const currentValue = Number(product.rating_value) || 0;
  const currentCount = Number(product.rating_count) || 0;
  const newCount = Math.max(0, currentCount - 1);
  let newValue = 0;

  if (newCount > 0) {
    const total = currentValue * currentCount - rating;
    newValue = total / newCount;
  }

  const { error: updateError } = await supabaseServer
    .from('products')
    .update({
      rating_value: newValue,
      rating_count: newCount,
    })
    .eq('id', productId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    rating_value: newValue,
    rating_count: newCount,
  });
}
