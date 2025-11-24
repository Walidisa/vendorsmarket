import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import crypto from 'crypto';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
};

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const username = body.username?.trim();
  const shopName = body.shop_name || body.shopName || '';
  const fullName = body.full_name || body.fullName || '';
  const email = body.email?.trim();
  const password = body.password || '';
  const location = body.location || '';
  const whatsapp = body.whatsapp || '';
  const instagram = body.instagram || '';
  const motto = body.motto || '';
  const about = body.about_description || body.aboutDescription || '';
  const profilePic = body.profile_pic || body.profilePic || '';
  const bannerPic = body.banner_pic || body.bannerPic || '';
  const userId = body.user_id || body.userId || null;

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'username, email, and password are required.' }, { status: 400 });
  }

  // Ensure username unique
  const { data: existing, error: existingError } = await supabaseServer
    .from('vendors')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
  }

  let authUserId = userId || null;

  // If no user_id provided, create a Supabase Auth user now
  if (!authUserId) {
    const { data: createdAuth, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    authUserId = createdAuth?.user?.id || null;
  }

  const hashed = password ? hashPassword(password) : null;

  const { data, error } = await supabaseServer
    .from('vendors')
    .insert({
      username,
      shop_name: shopName || username,
      full_name: fullName || username,
      email,
      password: hashed,
      user_id: authUserId,
      location,
      whatsapp,
      instagram,
      motto,
      about_description: about,
      profile_pic: profilePic,
      banner_pic: bannerPic,
      rating_value: 0,
      rating_count: 0,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
