import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { getPublicUrl } from '../../../lib/storage.js';

const toAssetUrl = (path) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed; // already a local/static path

  // Try Supabase Storage public URL first
  const { data } = getPublicUrl(supabaseServer, trimmed);
  const supaUrl = data?.publicUrl;

  // Fallback to local /images copies if present
  const filename = trimmed.split('/').pop();
  const localFallback =
    trimmed.startsWith('vendors/') || trimmed.startsWith('products/')
      ? `/images/${filename}`
      : '';

  return supaUrl || localFallback || trimmed;
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
    username: v.username,
    name: v.shop_name || v.username,
    shopName: v.shop_name || v.username,
    ownerName: v.full_name || v.username,
    location: v.location || '',
    avatar: toAssetUrl(v.profile_pic),
    banner: toAssetUrl(v.banner_pic),
    whatsapp: v.whatsapp || '',
    instagram: v.instagram || '',
    tagline: v.motto || '',
    aboutDescription: v.about_description || '',
    ratingValue: Number(v.rating_value) || 0,
    ratingCount: Number(v.rating_count) || 0,
    ownedProductIds: productIdsByVendor.get(v.username) || [],
    category: '', // not tracked in DB; leave blank
  }));

  return NextResponse.json(profiles);
}
