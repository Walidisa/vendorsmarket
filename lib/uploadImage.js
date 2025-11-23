import { supabase } from './supabaseClient.js';
import { STORAGE_BUCKET } from './storage.js';

export async function uploadImage(file, folder = 'products') {
  if (!file) throw new Error('No file selected');
  const ext = file.name.split('.').pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data?.publicUrl };
}
