// Centralized storage config for Supabase assets.
// Bucket name is "publicc" (since "public" was unavailable).
export const STORAGE_BUCKET = 'publicc';

/**
 * Given a Supabase client instance and a storage path (e.g., "products/cake1.jpg"),
 * returns the public URL for that asset in the configured bucket.
 */
export function getPublicUrl(supabase, path) {
  if (!path) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}
