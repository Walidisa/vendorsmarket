import { NextResponse } from 'next/server';
import { Resend } from 'resend';
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

  // Fire-and-forget email notification to support if Resend is configured
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.RESEND_TO || process.env.SUPPORT_EMAIL || 'support@vendorsmarket.com.ng';
    const from = process.env.RESEND_FROM || 'support@vendorsmarket.com.ng';
    const subject = `New feedback for ${resolvedUsername || vendorUserId || 'vendor'}`;
    const plain = [
      `Vendor: ${resolvedUsername || vendorUserId || ''}`,
      `Rating: ${rating || 'N/A'}`,
      `Message:`,
      message || '(no message provided)',
      '',
      `Vendor user id: ${vendorUserId || 'unknown'}`,
      `Created at: ${data?.created_at || new Date().toISOString()}`,
    ].join('\n');
    const html = `
      <p><strong>Vendor:</strong> ${resolvedUsername || vendorUserId || ''}</p>
      <p><strong>Rating:</strong> ${rating || 'N/A'}</p>
      <p><strong>Message:</strong><br/>${(message || '(no message provided)').replace(/\n/g, '<br/>')}</p>
      <p><strong>Vendor user id:</strong> ${vendorUserId || 'unknown'}</p>
      <p><strong>Created at:</strong> ${data?.created_at || new Date().toISOString()}</p>
    `;
    resend.emails.send({ from, to, subject, text: plain, html }).catch((err) => {
      console.error('Failed to send feedback email via Resend', err);
    });
  }

  return NextResponse.json(data);
}
