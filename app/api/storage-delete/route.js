import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer.js';
import { STORAGE_BUCKET } from '../../../lib/storage.js';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const paths = Array.isArray(body?.paths) ? body.paths.filter(Boolean) : [];
  if (!paths.length) {
    return NextResponse.json({ error: 'No paths provided' }, { status: 400 });
  }

  const uniquePaths = Array.from(new Set(paths));
  const { error } = await supabaseServer.storage.from(STORAGE_BUCKET).remove(uniquePaths);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: uniquePaths });
}
