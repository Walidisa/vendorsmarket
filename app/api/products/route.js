import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { getPublicUrl, STORAGE_BUCKET } from '../../../lib/storage.js';

// Cache products for a short window; invalidate immediately via /api/revalidate-products when writes occur.
export const revalidate = 0; // 5-minute safety TTL; tag-based revalidation overrides when triggered

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
    trimmed.startsWith('products/') || trimmed.startsWith('vendors/')
      ? `/images/${filename}`
      : '';

  const manualPublic =
    process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${trimmed}`
      : '';

  return supaUrl || manualPublic || localFallback || trimmed;
};

export async function GET() {
  // Fetch vendors separately to avoid any join aliasing issues
  const { data: vendorRows, error: vendorError } = await supabaseServer
    .from('vendors')
    .select(
      `
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

  const vendorsByUsername = new Map();
  (vendorRows || []).forEach((v) => {
    vendorsByUsername.set(v.username, v);
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
        vendor_username
      `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map((row) => {
    const vendor = vendorsByUsername.get(row.vendor_username) || {};
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
      vendor: vendor.username || vendor.shop_name || row.vendor_username || '',
      vendorUsername: vendor.username || row.vendor_username || '',
      vendorShopName: vendor.shop_name || vendor.username || row.vendor_username || '',
      sellerAvatar: vendor.profile_pic ? toAssetUrl(vendor.profile_pic) : '',
      image: cover,
      images: images.length ? images : (cover ? [cover] : []),
      description: row.description || '',
      ratingValue: Number(row.rating_value) || 0,
      ratingCount: Number(row.rating_count) || 0,
      vendorRatingValue: Number(vendor.rating_value) || 0,
      vendorRatingCount: Number(vendor.rating_count) || 0,
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
  const vendorUsername = body.vendor_username || body.vendorUsername || '';
  const coverImage = body.cover_image || body.coverImage || '';
  const images = Array.isArray(body.images) ? body.images : [];
  const description = body.description || '';

  if (!name || !vendorUsername || !mainCategory || !subcategory) {
    return NextResponse.json({ error: 'name, vendor_username, main_category, and subcategory are required.' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('products')
    .insert({
      name,
      price,
      main_category: mainCategory,
      subcategory,
      vendor_username: vendorUsername,
      cover_image: coverImage,
      images,
      description,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
