/* eslint-disable no-console */
// Seed Supabase from local JSON files (public/data/*.json)
// Safe defaults are used when fields are missing.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf8');
  contents
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const readJson = (relPath) => {
  const fullPath = path.join(__dirname, '..', relPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

const withDefault = (value, fallback) => (value === null || value === undefined ? fallback : value);

async function seedVendors(profiles) {
  const rows = profiles.map((p, index) => ({
    username: p.username || p.id || 'user_' + (index + 1),
    full_name: withDefault(p.ownerName, ''),
    shop_name: withDefault(p.shopName || p.name, ''),
    location: withDefault(p.location, ''),
    whatsapp: withDefault(p.whatsapp, ''),
    instagram: withDefault(p.instagram, ''),
    email: withDefault(p.email, null),
    password: withDefault(p.password, ''), // Note: consider hashing in production
    profile_pic: withDefault(p.avatar, ''),
    banner_pic: withDefault(p.banner, ''),
    rating_value: withDefault(p.ratingValue, 0),
    rating_count: withDefault(p.ratingCount, 0),
    motto: withDefault(p.tagline, ''),
    about_description: withDefault(p.aboutDescription, ''),
  }));

  const { error } = await supabase.from('vendors').upsert(rows, { onConflict: 'username' });
  if (error) throw error;
}

const isUuid = (val) =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

async function seedProducts(products, allowedVendors = new Set()) {
  const rows = products.map((p) => {
    const rawVendor = withDefault(p.vendor_username || p.vendorUsername || p.vendor || '', '').trim();
    const slugVendor = rawVendor ? slugify(rawVendor) : '';
    const vendorUsername = allowedVendors.has(slugVendor) ? slugVendor : null;
    const payload = {
      name: withDefault(p.name, ''),
      price: withDefault(p.price, 0),
      main_category: withDefault(p.main_category || p.mainCategory || '', ''),
      subcategory: withDefault(p.subcategory || p.subCategory || '', ''),
      vendor_username: vendorUsername,
      cover_image: withDefault(p.cover_image || p.coverImage || p.image || '', ''),
      images: Array.isArray(p.images) ? p.images : [],
      description: withDefault(p.description, ''),
      rating_value: withDefault(p.rating_value || p.ratingValue, 0),
      rating_count: withDefault(p.rating_count || p.ratingCount, 0),
      // created_at will default in DB
    };
    if (isUuid(p.id)) {
      payload.id = p.id;
    }
    return payload;
  });

  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function seedFeedback(feedback) {
  const rows = feedback.map((f) => {
    const rawVendor = withDefault(
      f.vendor_username || f.vendorUsername || f.sellerId || f.sellerName,
      '',
    ).trim();
    return {
      vendor_username: rawVendor ? slugify(rawVendor) : null,
      message: withDefault(f.comment || f.message, ''),
      rating: withDefault(f.rating, 0),
    };
  });

  const { error } = await supabase.from('feedback').insert(rows);
  if (error) throw error;
}

async function main() {
  try {
    const profiles = readJson('public/data/profiles.json');
    const products = readJson('public/data/products.json');
    const feedback = readJson('public/data/feedback.json');

    // Build vendor set from profiles (authoritative) and products (fallback)
    const profileVendorSet = new Set(
      profiles.map((p) => slugify(p.username || p.id || p.name || '')).filter(Boolean),
    );
    const productVendorSet = new Set(
      products
        .map((p) =>
          slugify(
            p.vendor_username ||
              p.vendorUsername ||
              p.vendor ||
              p.vendor_shop_name ||
              p.vendorShopName ||
              '',
          ),
        )
        .filter(Boolean),
    );

    // Create placeholder vendors for any product vendors missing from profiles
    const missingVendors = Array.from(productVendorSet).filter(
      (v) => v && !profileVendorSet.has(v),
    );
    const placeholderVendors = missingVendors.map((username, idx) => ({
      username,
      id: username,
      ownerName: username,
      shopName: username,
      name: username,
      location: '',
      whatsapp: '',
      instagram: '',
      email: '',
      password: '',
      avatar: '',
      banner: '',
      ratingValue: 0,
      ratingCount: 0,
      tagline: '',
      aboutDescription: '',
    }));

    await seedVendors([...profiles, ...placeholderVendors]);

    const allowedVendors = new Set([...profileVendorSet, ...productVendorSet]);

    await seedProducts(products, allowedVendors);
    await seedFeedback(feedback);

    console.log('Supabase seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

main();
