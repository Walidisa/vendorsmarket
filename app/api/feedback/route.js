import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('feedback')
    .select(
      `
        id,
        vendor_username,
        message,
        rating,
        created_at,
        vendors:vendor_username (
          username,
          shop_name
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const feedback = (data || []).map((row) => ({
    sellerId: row.vendor_username || '',
    sellerName: row.vendors?.shop_name || row.vendor_username || '',
    rating: Number(row.rating) || 0,
    comment: row.message || '',
    createdAt: row.created_at || null,
  }));

  return NextResponse.json(feedback, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const vendorUsername = body?.vendor_username || body?.vendorUsername || '';
  const message = body?.message || body?.comment || '';
  const rating = Number(body?.rating) || 0;
  let vendorUserId = body?.vendor_user_id || body?.vendorUserId || null;

  if (!vendorUsername || !rating) {
    return NextResponse.json({ error: 'vendor_username and rating are required.' }, { status: 400 });
  }

  if (!vendorUserId && vendorUsername) {
    const { data: vendorRow } = await supabaseServer
      .from('vendors')
      .select('user_id')
      .eq('username', vendorUsername)
      .maybeSingle();
    if (vendorRow?.user_id) {
      vendorUserId = vendorRow.user_id;
    }
  }

  const { data, error } = await supabaseServer
    .from('feedback')
    .insert({
      vendor_username: vendorUsername,
      message,
      rating,
      vendor_user_id: vendorUserId,
    })
    .select('id, vendor_username, message, rating, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
