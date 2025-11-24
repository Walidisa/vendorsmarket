// Centralized storage config for Supabase assets.
// Bucket name is "publicc" (since "public" was unavailable).
export const STORAGE_BUCKET = 'publicc';

/**
 * Given a Supabase client instance and a storage path (e.g., "products/cake1.jpg"),
 * returns the public URL for that asset in the configured bucket.
 */
export function getPublicUrl(supabase, path) {
  if (!path) return '';
  let key = path.trim();
  if (key.startsWith(`${STORAGE_BUCKET}/`)) {
    key = key.replace(`${STORAGE_BUCKET}/`, '');
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return data?.publicUrl || '';
}
