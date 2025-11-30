import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { getPublicUrl, STORAGE_BUCKET } from '../../../lib/storage.js';

const toStorageKey = (path) => {
  if (!path) return null;
  let key = path.trim();
  if (!key) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = key.indexOf(marker);
  if (idx >= 0) {
    key = key.slice(idx + marker.length);
  }
  if (key.startsWith(`${STORAGE_BUCKET}/`)) key = key.slice(`${STORAGE_BUCKET}/`.length);
  if (key.startsWith('/')) key = key.slice(1);
  if (key.includes('?')) key = key.split('?')[0];
  if (key.includes('#')) key = key.split('#')[0];
  return key || null;
};

// Cache products for a short window; invalidate immediately via /api/revalidate-products when writes occur.
export const revalidate = 0; // 5-minute safety TTL; tag-based revalidation overrides when triggered

const toAssetUrl = (path) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed; // already a local/static path

  const normalized = trimmed.startsWith(`${STORAGE_BUCKET}/`)
    ? trimmed.replace(`${STORAGE_BUCKET}/`, '')
    : trimmed;

  // Try Supabase Storage public URL first
  const { data } = getPublicUrl(supabaseServer, normalized);
  const supaUrl = data?.publicUrl;

  // Fallback to local /images copies if present
  const filename = normalized.split('/').pop();
  const localFallback =
    normalized.startsWith('products/') || normalized.startsWith('vendors/')
      ? `/images/${filename}`
      : '';

  const manualPublic =
    process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${normalized}`
      : '';

  return supaUrl || manualPublic || localFallback || normalized;
};

export async function GET() {
  // Fetch vendors separately to avoid any join aliasing issues
  const { data: vendorRows, error: vendorError } = await supabaseServer
    .from('vendors')
    .select(
      `
        user_id,
        username,
        shop_name,
        profile_pic,
        banner_pic,
        rating_value,
        rating_count,
        motto,
        about_description,
        location,
        whatsapp,
        instagram,
        full_name
      `,
    );

  if (vendorError) {
    return NextResponse.json({ error: vendorError.message }, { status: 500 });
  }

  // Aggregate vendor ratings from feedback as a fallback if vendor.rating_value/count are not set
  const feedbackByVendor = new Map();
  const { data: feedbackRows } = await supabaseServer
    .from('feedback')
    .select('vendor_user_id, vendor_username, rating');
  if (Array.isArray(feedbackRows)) {
    feedbackRows.forEach((row) => {
      const key = row.vendor_user_id || row.vendor_username;
      const val = Number(row.rating) || 0;
      if (!key) return;
      const current = feedbackByVendor.get(key) || { total: 0, count: 0 };
      feedbackByVendor.set(key, { total: current.total + val, count: current.count + 1 });
    });
  }

  const vendorsByUsername = new Map();
  const vendorsById = new Map();
  (vendorRows || []).forEach((v) => {
    vendorsByUsername.set(v.username, v);
    if (v.user_id) vendorsById.set(v.user_id, v);
  });

  const { data, error } = await supabaseServer
    .from('products')
    .select(
      `
        id,
        name,
        price,
        main_category,
        subcategory,
        cover_image,
        images,
        description,
        rating_value,
        rating_count,
        vendor_username,
        user_id
      `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map((row) => {
    const vendor =
      vendorsById.get(row.user_id) ||
      vendorsByUsername.get(row.vendor_username) ||
      {};
    const feedbackKey = row.user_id || vendor.user_id || row.vendor_username;
    const rawCover = row.cover_image || (Array.isArray(row.images) ? row.images[0] : '');
    const cover = toAssetUrl(rawCover);

    let images = [];
    if (cover) images.push(cover);
    if (Array.isArray(row.images)) {
      row.images.forEach((img) => {
        const url = toAssetUrl(img);
        if (url) images.push(url);
      });
    }
    // de-duplicate images while preserving order
    const seen = new Set();
    images = images.filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    return {
      id: row.id,
      name: row.name,
      price: Number(row.price) || 0,
      mainCategory: row.main_category || '',
      subCategory: row.subcategory || '',
      vendor: vendor.shop_name || vendor.username || row.vendor_username || '',
      vendorUsername: vendor.username || row.vendor_username || '',
      vendorShopName: vendor.shop_name || vendor.username || row.vendor_username || '',
      vendorFullName: vendor.full_name || '',
      vendorUserId: vendor.user_id || row.user_id || null,
      sellerAvatar: vendor.profile_pic
        ? toAssetUrl(vendor.profile_pic)
        : toAssetUrl('vendors/default-pfp.jpg'),
      image: cover,
      images: images.length ? images : (cover ? [cover] : []),
      description: row.description || '',
      ratingValue: Number(row.rating_value) || 0,
      ratingCount: Number(row.rating_count) || 0,
      vendorRatingValue: (() => {
        const direct = Number(vendor.rating_value);
        if (direct) return direct;
        const agg = feedbackByVendor.get(feedbackKey);
        return agg && agg.count > 0 ? agg.total / agg.count : 0;
      })(),
      vendorRatingCount: (() => {
        const direct = Number(vendor.rating_count);
        if (direct) return direct;
        const agg = feedbackByVendor.get(feedbackKey);
        return agg?.count || 0;
      })(),
      ownerUserId: row.user_id || vendor.user_id || null,
      vendorLocation: vendor.location || '',
      whatsapp: vendor.whatsapp || '',
      instagram: vendor.instagram || '',
      motto: vendor.motto || '',
      aboutDescription: vendor.about_description || '',
    };
  });

  return NextResponse.json(products);
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name?.trim() || '';
  const price = Number(body.price) || 0;
  const mainCategory = body.main_category || body.mainCategory || '';
  const subcategory = body.subcategory || body.subCategory || '';
  const coverImage = body.cover_image || body.coverImage || '';
  const images = Array.isArray(body.images) ? body.images : [];
  const description = body.description || '';
  let userId = body.user_id || body.userId || null;
  let vendorUsername = body.vendor_username || body.vendorUsername || '';

  if (!name || !userId || !mainCategory || !subcategory) {
    return NextResponse.json({ error: 'name, user_id, main_category, and subcategory are required.' }, { status: 400 });
  }

  // Resolve vendor username from user_id if not provided (used for display only)
  if (!vendorUsername && userId) {
    const { data: vendorRow } = await supabaseServer
      .from('vendors')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle();
    if (vendorRow?.username) {
      vendorUsername = vendorRow.username;
    }
  }

  const { data, error } = await supabaseServer
    .from('products')
    .insert({
      name,
      price,
      main_category: mainCategory,
      subcategory,
      vendor_username: vendorUsername || null,
      cover_image: coverImage || null,
      images,
      description,
      user_id: userId,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
