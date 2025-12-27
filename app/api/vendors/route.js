import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { resend } from '../../../lib/resendClient.js';

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

  // Fire-and-forget welcome email; do not block signup
  if (resend && email) {
    const from = process.env.RESEND_FROM || 'VendorsMarket <support@vendorsmarket.com.ng>';
    const displayName = fullName || username || 'there';
    resend.emails
      .send({
        from,
        to: email,
        subject: 'Welcome to Vendors Market',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d; max-width: 560px; margin: 0 auto; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <div style="width: 42px; height: 42px; border-radius: 12px; background: #0d3b66; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="https://vendorsmarket.com.ng/icons/app-icon.png" alt="Vendors Market" width="42" height="42" style="display:block; width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
              </div>
              <div style="font-size: 18px; font-weight: 700; color: #0d3b66;">Vendors Market</div>
            </div>
            <h2 style="margin: 0 0 12px; color: #0d3b66;">Welcome, ${displayName}!</h2>
            <p style="margin: 0 0 10px;">Your vendor account is ready. You can log in and start adding products right away.</p>
            <p style="margin: 0 0 10px;">Thank you for choosing Vendors Market. We’re excited to make great sales together.</p>
            <div style="margin: 14px 0; padding: 12px 14px; background: #f5f8fc; border: 1px solid rgba(13,59,102,0.08); border-radius: 12px;">
              <p style="margin: 0 0 8px; font-weight: 700; color: #0d3b66;">What you can do:</p>
              <ul style="margin: 0; padding-left: 18px; color: #1d1d1d;">
                <li style="margin: 4px 0;">Create and showcase your listings with photos and details.</li>
                <li style="margin: 4px 0;">Share your vendor profile and grow your audience.</li>
                <li style="margin: 4px 0;">Receive and respond to buyer messages/feedback.</li>
                <li style="margin: 4px 0;">Track ratings to build trust with shoppers.</li>
              </ul>
            </div>
            <p style="margin: 12px 0;">Need help? Reply to this email and we&apos;ll assist.</p>
            <p style="margin: 16px 0 0; font-weight: 600; color: #0d3b66;">– The Vendors Market Team</p>
          </div>
        `,
      })
      .catch(() => {
        // ignore email failures to avoid blocking signup
      });
  }

  return NextResponse.json(data, { status: 201 });
}
