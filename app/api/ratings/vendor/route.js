import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const vendorUsername = body?.vendor_username || body?.vendorUsername || '';
  const rating = Number(body?.rating) || 0;

  if (!vendorUsername || !rating) {
    return NextResponse.json({ error: 'vendor_username and rating are required.' }, { status: 400 });
  }

  const { data: vendor, error: selectError } = await supabaseServer
    .from('vendors')
    .select('rating_value, rating_count')
    .eq('username', vendorUsername)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
  }

  const currentValue = Number(vendor.rating_value) || 0;
  const currentCount = Number(vendor.rating_count) || 0;
  const total = currentValue * currentCount + rating;
  const newCount = currentCount + 1;
  const newValue = total / newCount;

  const { error: updateError } = await supabaseServer
    .from('vendors')
    .update({ rating_value: newValue, rating_count: newCount })
    .eq('username', vendorUsername);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    rating_value: newValue,
    rating_count: newCount,
  });
}
