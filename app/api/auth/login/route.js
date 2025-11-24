import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer.js';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim();
  const password = body?.password || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Verify against Supabase Auth
  const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const userId = authData.user.id;

  const { data, error } = await supabaseServer
    .from('vendors')
    .select(
      `
        username,
        shop_name,
        full_name,
        email,
        user_id,
        profile_pic,
        banner_pic,
        motto,
        about_description,
        location,
        whatsapp,
        instagram
      `,
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Vendor profile not found for this user.' }, { status: 404 });
  }

  return NextResponse.json({
    accessToken: authData.session?.access_token,
    refreshToken: authData.session?.refresh_token,
    userId,
    username: data.username,
    shopName: data.shop_name,
    fullName: data.full_name,
    email: data.email,
    profilePic: data.profile_pic,
    bannerPic: data.banner_pic,
    motto: data.motto,
    aboutDescription: data.about_description,
    location: data.location,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
  });
}
