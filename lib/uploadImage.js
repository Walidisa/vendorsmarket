import { supabase } from './supabaseClient.js';
import { STORAGE_BUCKET } from './storage.js';

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // reject outright above 5MB
const MAX_FINAL_BYTES = 400 * 1024; // final compressed size must be <= 400KB
const TARGET_BYTES = 100 * 1024; // preferred target ~100KB if achievable
const ALLOWED_SIGNATURES = [
  '137,80,78,71', // PNG
  '255,216,255', // JPG/JPEG (first 3 bytes)
  '82,73,70,70', // WebP/RIFF container
  '71,73,70,56', // GIF8
];

async function compressImage(file) {
  try {
    if (typeof document === 'undefined') return file;
    const imageDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = imageDataUrl;
    });

    let maxDim = 1600;
    let quality = 0.72;
    let attempts = 0;
    let lastBlob = null;

    while (attempts < 10) {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const targetWidth = Math.max(1, Math.round(img.width * scale));
      const targetHeight = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
          'image/jpeg',
          quality
        );
      });

      lastBlob = blob;
      if (blob.size <= TARGET_BYTES) break;

      // tighten settings and try again
      maxDim = Math.max(400, Math.round(maxDim * 0.65));
      quality = Math.max(0.08, quality - 0.08);
      attempts += 1;
    }

    if (!lastBlob) return file;

    const newName = (file.name || 'image').replace(/\.\w+$/, '.jpg');
    return new File([lastBlob], newName, { type: 'image/jpeg' });
  } catch (_) {
    // Fall back to original if compression fails
    return file;
  }
}

export async function uploadImage(file, folder = 'products', label = 'Image') {
  if (!file) throw new Error('No file selected');

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${label} is too large (max 5MB)`);
  }

  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !file.type?.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Compress if possible, then enforce final size
  let toUpload = await compressImage(file);
  if (toUpload.size > MAX_FINAL_BYTES) {
    throw new Error(`${label} is too large after compression (max 400KB)`);
  }

  // Magic number check (first 4 bytes) to reduce spoofing
  const buf = await toUpload.arrayBuffer();
  const sig = Array.from(new Uint8Array(buf.slice(0, 4))).join(',');
  if (!ALLOWED_SIGNATURES.some((s) => sig.startsWith(s))) {
    throw new Error('Invalid image content');
  }

  const finalExt = (toUpload.name || '').split('.').pop().toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${finalExt}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, toUpload, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data?.publicUrl };
}
