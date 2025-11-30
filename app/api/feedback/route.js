import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('feedback')
    .select('id, vendor_user_id, vendor_username, message, rating, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vendorIds = [...new Set((data || []).map((row) => row.vendor_user_id).filter(Boolean))];
  let vendorById = new Map();
  if (vendorIds.length) {
    const { data: vendorRows } = await supabaseServer
      .from('vendors')
      .select('user_id, username, shop_name')
      .in('user_id', vendorIds);
    vendorById = new Map((vendorRows || []).map((v) => [v.user_id, v]));
  }

  const feedback = (data || []).map((row) => {
    const vendor = row.vendor_user_id ? vendorById.get(row.vendor_user_id) : null;
    return {
      sellerId: row.vendor_user_id || row.vendor_username || '',
      sellerName: vendor?.shop_name || vendor?.username || row.vendor_username || '',
      rating: Number(row.rating) || 0,
      comment: row.message || '',
      createdAt: row.created_at || null,
      vendorUsername: vendor?.username || row.vendor_username || '',
      vendorUserId: row.vendor_user_id || vendor?.user_id || null,
    };
  });

  return NextResponse.json(feedback, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const message = body?.message || body?.comment || '';
  const rating = Number(body?.rating) || 0;
  const vendorUsername = body?.vendor_username || body?.vendorUsername || '';
  let vendorUserId = body?.vendor_user_id || body?.vendorUserId || null;

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

  if (!vendorUserId || !rating) {
    return NextResponse.json({ error: 'vendor_user_id and rating are required.' }, { status: 400 });
  }

  let resolvedUsername = vendorUsername;
  if (!resolvedUsername) {
    const { data: vendorRow } = await supabaseServer
      .from('vendors')
      .select('username')
      .eq('user_id', vendorUserId)
      .maybeSingle();
    if (vendorRow?.username) {
      resolvedUsername = vendorRow.username;
    }
  }

  const { data, error } = await supabaseServer
    .from('feedback')
    .insert({
      vendor_user_id: vendorUserId,
      vendor_username: resolvedUsername || null,
      message,
      rating,
    })
    .select('id, vendor_user_id, vendor_username, message, rating, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
