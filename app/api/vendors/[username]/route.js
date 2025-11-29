import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';
import { STORAGE_BUCKET } from '../../../../lib/storage.js';
import crypto from 'crypto';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Simple auth guard: require a Supabase auth session and ownership for destructive actions.
async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

const toStorageKey = (path) => {
  if (!path) return null;
  let key = path.trim();
  if (!key) return null;
  const bucketPrefix = `${STORAGE_BUCKET}/`;
  const publicUrlMarker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

  // Strip full public URL if present (https://.../storage/v1/object/public/bucket/path)
  const idxUrl = key.indexOf(publicUrlMarker);
  if (idxUrl >= 0) {
    key = key.slice(idxUrl + publicUrlMarker.length);
  }

  // Strip bucket prefix if included
  if (key.startsWith(bucketPrefix)) {
    key = key.slice(bucketPrefix.length);
  }

  // Also handle the case where bucket prefix appears later in the string
  const idx = key.indexOf(bucketPrefix);
  if (idx >= 0) {
    key = key.slice(idx + bucketPrefix.length);
  }

  return key || null;
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
};

export async function PUT(request, { params }) {
  const usernameParam = params?.username || '';
  const body = await request.json().catch(() => null);
  if (!body || !usernameParam) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Fetch vendor to get user_id and current asset paths for auth updates
  const { data: vendorRow, error: vendorErr } = await supabaseServer
    .from('vendors')
    .select('user_id, profile_pic, banner_pic')
    .eq('username', usernameParam)
    .maybeSingle();
  if (vendorErr) {
    return NextResponse.json({ error: vendorErr.message }, { status: 500 });
  }
  if (!vendorRow) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }
  const existingProfilePic = vendorRow.profile_pic || '';
  const existingBannerPic = vendorRow.banner_pic || '';

  // Auth check: only allow owner to update
  const authUser = await getAuthUser(request);
  if (!authUser || !vendorRow.user_id || authUser.id !== vendorRow.user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!vendorRow.user_id) {
    return NextResponse.json({ error: 'Vendor is missing user_id; cannot update.' }, { status: 400 });
  }

  const shopName = body.shop_name || body.shopName || '';
  const fullName = body.full_name || body.fullName || '';
  const email = body.email?.trim();
  const password = body.password || '';
  const location = body.location || '';
  const whatsapp = body.whatsapp || '';
  const instagram = body.instagram || '';
  const motto = body.motto || '';
  const about = body.about_description || body.aboutDescription || '';
  const profilePicRaw = body.profile_pic ?? body.profilePic;
  const bannerPicRaw = body.banner_pic ?? body.bannerPic;

  const updates = {
    shop_name: shopName,
    full_name: fullName,
    email,
    location,
    whatsapp,
    instagram,
    motto,
    about_description: about,
  };

  if (!email) delete updates.email;
  if (!shopName) delete updates.shop_name;
  if (!fullName) delete updates.full_name;
  if (!location) delete updates.location;
  if (!whatsapp) delete updates.whatsapp;
  if (!instagram) delete updates.instagram;
  if (!motto) delete updates.motto;
  if (!about) delete updates.about_description;

  // Explicitly handle profile/banner updates so empty strings/null clear the DB field
  if (profilePicRaw !== undefined) {
    updates.profile_pic = (profilePicRaw ?? "").trim();
  }
  if (bannerPicRaw !== undefined) {
    updates.banner_pic = (bannerPicRaw ?? "").trim();
  }

  if (password) {
    updates.password = hashPassword(password);
  }

  // Update Supabase Auth user if we have a linked user_id and auth changes requested
  if (vendorRow.user_id && (email || password)) {
    const authUpdate = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;
    const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(
      vendorRow.user_id,
      authUpdate
    );
    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 500 });
    }
  }

  const { error } = await supabaseServer
    .from('vendors')
    .update(updates)
    .eq('username', usernameParam);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clean up storage for replaced/cleared assets
  const storageKeysToDelete = [];
  if (updates.profile_pic !== undefined && updates.profile_pic !== existingProfilePic) {
    const key = toStorageKey(existingProfilePic);
    if (key && !key.includes('default-pfp')) storageKeysToDelete.push(key);
  }
  if (updates.banner_pic !== undefined && updates.banner_pic !== existingBannerPic) {
    const key = toStorageKey(existingBannerPic);
    if (key) storageKeysToDelete.push(key);
  }
  if (storageKeysToDelete.length) {
    await supabaseServer.storage.from(STORAGE_BUCKET).remove(storageKeysToDelete).catch(() => {});
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(request, { params }) {
  const usernameParam = params?.username || '';
  if (!usernameParam) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Fetch vendor row to get user_id
  const { data: vendorRow, error: vendorErr } = await supabaseServer
    .from('vendors')
    .select('user_id, profile_pic, banner_pic')
    .eq('username', usernameParam)
    .maybeSingle();

  if (vendorErr) {
    return NextResponse.json({ error: vendorErr.message }, { status: 500 });
  }
  if (!vendorRow) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // Auth check: only allow owner to delete
  const authUser = await getAuthUser(request);
  if (!authUser || !vendorRow.user_id || authUser.id !== vendorRow.user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!vendorRow.user_id) {
    return NextResponse.json({ error: 'Vendor is missing user_id; cannot delete.' }, { status: 400 });
  }

  // Fetch products to gather storage keys
  const { data: productRows, error: fetchProductsErr } = await supabaseServer
    .from('products')
    .select('cover_image, images')
    .eq('vendor_username', usernameParam);
  if (fetchProductsErr) {
    return NextResponse.json({ error: fetchProductsErr.message }, { status: 500 });
  }

  const storageKeys = [];
  [vendorRow.profile_pic, vendorRow.banner_pic].forEach((p) => {
    const key = toStorageKey(p);
    if (key) storageKeys.push(key);
  });
  (productRows || []).forEach((p) => {
    const cover = toStorageKey(p.cover_image);
    if (cover) storageKeys.push(cover);
    if (Array.isArray(p.images)) {
      p.images.forEach((img) => {
        const k = toStorageKey(img);
        if (k) storageKeys.push(k);
      });
    }
  });

  // Delete storage objects (ignore missing files; return error on other failures)
  const uniqueKeys = [...new Set(storageKeys)];
  if (uniqueKeys.length) {
    const { error: storageErr } = await supabaseServer.storage.from(STORAGE_BUCKET).remove(uniqueKeys);
    if (storageErr) {
      return NextResponse.json({ error: storageErr.message }, { status: 500 });
    }
  }

  // Delete feedback for this vendor
  const { error: feedbackErr } = await supabaseServer
    .from('feedback')
    .delete()
    .eq('vendor_username', usernameParam);
  if (feedbackErr) {
    return NextResponse.json({ error: feedbackErr.message }, { status: 500 });
  }

  // Delete products for this vendor
  const { error: productsErr } = await supabaseServer
    .from('products')
    .delete()
    .eq('vendor_username', usernameParam);
  if (productsErr) {
    return NextResponse.json({ error: productsErr.message }, { status: 500 });
  }

  // Delete vendor row
  const { error: vendorDeleteErr } = await supabaseServer
    .from('vendors')
    .delete()
    .eq('username', usernameParam);
  if (vendorDeleteErr) {
    return NextResponse.json({ error: vendorDeleteErr.message }, { status: 500 });
  }

  // Delete Auth user last; if it fails, return a warning but keep data deletion
  if (vendorRow.user_id) {
    const { error: authDeleteError } = await supabaseServer.auth.admin.deleteUser(vendorRow.user_id);
    if (authDeleteError) {
      return NextResponse.json({ deleted: true, warning: `Auth user not deleted: ${authDeleteError.message}` });
    }
  }

  return NextResponse.json({ deleted: true });
}
