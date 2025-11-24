import { supabase } from './supabaseClient.js';
import { STORAGE_BUCKET } from './storage.js';

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_BYTES = 400 * 1024; // 400 KB
const ALLOWED_SIGNATURES = [
  '137,80,78,71', // PNG
  '255,216,255', // JPG/JPEG (first 3 bytes)
  '82,73,70,70', // WebP/RIFF container
  '71,73,70,56', // GIF8
];

export async function uploadImage(file, folder = 'products') {
  if (!file) throw new Error('No file selected');

  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !file.type?.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File too large (max 10MB)');
  }

  // Magic number check (first 4 bytes) to reduce spoofing
  const buf = await file.arrayBuffer();
  const sig = Array.from(new Uint8Array(buf.slice(0, 4))).join(',');
  if (!ALLOWED_SIGNATURES.some((s) => sig.startsWith(s))) {
    throw new Error('Invalid image content');
  }

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data?.publicUrl };
}
