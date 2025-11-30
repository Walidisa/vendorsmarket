import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating) || 0;
  const vendorUserId =
    body?.vendor_user_id ||
    body?.vendorUserId ||
    body?.user_id ||
    body?.userId ||
    null;
  const vendorUsername = body?.vendor_username || body?.vendorUsername || '';

  if (!vendorUserId && !vendorUsername) {
    return NextResponse.json({ error: 'vendor_user_id is required.' }, { status: 400 });
  }
  if (!rating) {
    return NextResponse.json({ error: 'rating is required.' }, { status: 400 });
  }

  let resolvedUserId = vendorUserId;
  if (!resolvedUserId && vendorUsername) {
    const { data: vendorRow } = await supabaseServer
      .from('vendors')
      .select('user_id')
      .eq('username', vendorUsername)
      .maybeSingle();
    if (vendorRow?.user_id) resolvedUserId = vendorRow.user_id;
  }

  if (!resolvedUserId) {
    return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
  }

  const { data: vendor, error: selectError } = await supabaseServer
    .from('vendors')
    .select('rating_value, rating_count')
    .eq('user_id', resolvedUserId)
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
    .eq('user_id', resolvedUserId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    rating_value: newValue,
    rating_count: newCount,
  });
}
