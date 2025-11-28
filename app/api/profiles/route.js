import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { getPublicUrl, STORAGE_BUCKET } from '../../../lib/storage.js';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const toAssetUrl = (path) => {
  if (!path) return '';
  let key = String(path).trim();
  if (/^https?:\/\//i.test(key)) return key;
  if (key.startsWith('/')) return key; // already a local/static path

  // Force known defaults to local images instead of storage
  const normalized = key.toLowerCase();
  if (normalized.includes('default-banner')) return '/images/default-banner.jpg';
  if (normalized.includes('default-seller')) return '/images/default-seller.jpg';

  // Strip bucket prefixes if present (public/publicc)
  if (key.startsWith(`${STORAGE_BUCKET}/`)) {
    key = key.replace(`${STORAGE_BUCKET}/`, '');
  } else if (key.startsWith('public/')) {
    key = key.replace('public/', '');
  }

  // Try Supabase Storage public URL first
  const { data } = getPublicUrl(supabaseServer, key);
  const supaUrl = data?.publicUrl;

  // Fallback to local /images copies if present
  const filename = key.split('/').pop();
  const localFallback =
    key.startsWith('vendors/') || key.startsWith('products/')
      ? `/images/${filename}`
      : '';

  const manualPublic =
    process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`
      : '';

  return supaUrl || manualPublic || localFallback || key;
};

export async function GET() {
  // Fetch vendors
  const { data: vendors, error: vendorsError } = await supabaseServer
    .from('vendors')
    .select('*');

  if (vendorsError) {
    return NextResponse.json({ error: vendorsError.message }, { status: 500 });
  }

  // Fetch product ids by vendor to keep the old ownedProductIds behavior
  const { data: products, error: productsError } = await supabaseServer
    .from('products')
    .select('id, vendor_username');

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const productIdsByVendor = new Map();
  (products || []).forEach((p) => {
    const key = p.vendor_username || '';
    if (!productIdsByVendor.has(key)) {
      productIdsByVendor.set(key, []);
    }
    productIdsByVendor.get(key).push(p.id);
  });

  const profiles = (vendors || []).map((v) => ({
    id: v.username,
    username: v.username,              // handle / slug source
    name: v.full_name || '',   // display full name
    shopName: v.shop_name || v.username,
    userId: v.user_id || null,
    ownerName: v.full_name || '',      // full name shown under handle
    location: v.location || '',
    avatar: toAssetUrl(v.profile_pic || 'vendors/default-seller.jpg'),
    banner: toAssetUrl(v.banner_pic || 'vendors/default-banner.jpg'),
    whatsapp: v.whatsapp || '',
    instagram: v.instagram || '',
    tagline: v.motto || '',
    aboutDescription: v.about_description || '',
    ratingValue: Number(v.rating_value) || 0,
    ratingCount: Number(v.rating_count) || 0,
    ownedProductIds: productIdsByVendor.get(v.username) || [],
    category: '', // not tracked in DB; leave blank
  }));

  return NextResponse.json(profiles, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}
