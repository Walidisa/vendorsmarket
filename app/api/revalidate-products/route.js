import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

function authorize(request) {
  const secret = process.env.REVALIDATE_SECRET;
  const header = request.headers.get('x-revalidate-secret');
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (!secret) return { ok: false, status: 500, error: 'Missing REVALIDATE_SECRET env' };
  if (header === secret || querySecret === secret) return { ok: true };
  return { ok: false, status: 401, error: 'Unauthorized' };
}

export async function POST(request) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  revalidateTag('products');
  return NextResponse.json({ revalidated: true, tag: 'products' });
}

// Convenience: allow GET for manual testing (e.g., browser hit with ?secret=...)
export async function GET(request) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  revalidateTag('products');
  return NextResponse.json({ revalidated: true, tag: 'products' });
}

// Allow PUT/DELETE to trigger revalidation after updates/deletes
export async function PUT(request) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  revalidateTag('products');
  return NextResponse.json({ revalidated: true, tag: 'products' });
}

export async function DELETE(request) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  revalidateTag('products');
  return NextResponse.json({ revalidated: true, tag: 'products' });
}
