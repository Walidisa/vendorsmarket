'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { uploadImage } from '../../../lib/uploadImage';
import { supabase } from '../../../lib/supabaseClient';
import { STORAGE_BUCKET } from '../../../lib/storage';
import { ProductFormSkeleton } from '../../components/ProductFormSkeleton';

const extractStorageKey = (url) => {
  if (!url) return null;
  let key = String(url).trim();
  if (!key) return null;
  if (key.includes('?')) key = key.split('?')[0];
  if (key.includes('#')) key = key.split('#')[0];
  if (key.startsWith('http')) {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const idx = key.indexOf(marker);
    if (idx === -1) return null;
    key = key.slice(idx + marker.length);
  }
  if (key.startsWith(`${STORAGE_BUCKET}/`)) key = key.replace(`${STORAGE_BUCKET}/`, '');
  if (key.startsWith('/')) key = key.slice(1);
  return key || null;
};

const mainCategories = [
  { value: 'food', label: 'Food, Drinks, Snacks & Utensils' },
  { value: 'clothing', label: 'Clothing & accessories' },
];

const subCategories = {
  food: [
    { value: 'snacks', label: 'Meatpie, Spring Rolls, Puff Puff & More Fried Snacks' },
    { value: 'shawarma', label: 'Shawarma, Wraps, Sandwiches & More' },
    { value: 'meals', label: 'Full Meals' },
    { value: 'drinks', label: 'Drinks, Popcorn, Sweets & More' },
    { value: 'cakes', label: 'Cakes, Donuts, Cinnamon Rolls & More Tasty Treats' },
    { value: 'spices', label: 'Yaji, Spices, Garri & More' },
    { value: 'kitchenware', label: 'Kitchenware' },
    { value: 'food-others', label: 'Other Food Items' },
  ],
  clothing: [
    { value: 'shoes', label: 'Shoes' },
    { value: 'jallabiya', label: 'Jallabiyas & Abayas' },
    { value: 'hijabs', label: 'Hijabs & Veils' },
    { value: 'shirts', label: 'Shirts & Gowns' },
    { value: 'materials', label: 'Textile, Fabrics & Traditional Clothing' },
    { value: 'skincare', label: 'Hair Products, Skincare, Perfumes & More' },
    { value: 'trousers', label: 'Trousers & Sweatpants' },
    { value: 'hats', label: 'Hats' },
    { value: 'bags', label: 'Bags' },
    { value: 'watches', label: 'Watches, Jewelry, Glasses & More' },
    { value: 'tech', label: 'Tech & Phone Accessories' },
    { value: 'clothing-others', label: 'Other Clothing & Accessories' },
  ],
};

export default function EditProductPage() {
  const params = useParams();
  const rawProductId = params?.id;
  const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [form, setForm] = useState({
    name: '',
    price: '',
    main_category: 'food',
    subcategory: subCategories.food[0].value,
    cover_image: '',
    images: '',
    description: '',
  });
  const [status, setStatus] = useState('');
  const [theme, setTheme] = useState('clothing');
  const [coverFile, setCoverFile] = useState(null);
  const [cropCoverFile, setCropCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [originalCover, setOriginalCover] = useState('');
  const [originalGallery, setOriginalGallery] = useState([]);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [sessionVendor, setSessionVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const CropperModal = dynamic(() => import('../../components/ImageCropper').then((mod) => mod.ImageCropper), {
    ssr: false,
  });

  const subOptions = useMemo(() => subCategories[form.main_category] || [], [form.main_category]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? (localStorage.getItem('activeTheme') || 'clothing') : 'clothing';
    setTheme(t);
  }, []);

  useEffect(() => {
    // Reset subcategory to first option when main changes
    const options = subCategories[form.main_category] || [];
    setForm((prev) => ({
      ...prev,
      subcategory: options[0]?.value || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.main_category]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      if (!userId) {
        router.replace('/login');
        return;
      }
      try {
        const [profilesRes, productsRes] = await Promise.all([
          fetch('/api/profiles'),
          fetch('/api/products'),
        ]);
        const profiles = profilesRes.ok ? await profilesRes.json() : [];
        const vendor = profiles.find((p) => p.userId === userId) || null;
        if (!vendor) {
          setError('No vendor profile found for this account.');
          setLoading(false);
          return;
        }
        setSessionVendor(vendor);

        const products = productsRes.ok ? await productsRes.json() : [];
        const prod = products.find((p) => p.id === productId) || null;
        if (!prod) {
          setError('Product not found.');
          setLoading(false);
          return;
        }

        const coverImg = prod.cover_image || prod.image || '';
        const galleryImgs = Array.isArray(prod.images) ? prod.images.filter((img) => img !== (prod.cover_image || prod.image)) : [];
        setForm({
          name: prod.name || '',
          price: prod.price || '',
          main_category: prod.mainCategory || prod.main_category || 'food',
          subcategory: prod.subCategory || prod.subcategory || (prod.mainCategory === 'clothing' ? subCategories.clothing[0].value : subCategories.food[0].value),
          cover_image: coverImg,
          images: galleryImgs,
          description: prod.description || '',
        });
        setOriginalCover(coverImg);
        setOriginalGallery(galleryImgs);
      } catch (e) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, router]);

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(null);
    setCropCoverFile(file);
    if (file && file.size > 400 * 1024) {
      setStatus('Cover image is large and will be compressed; quality may be reduced.');
    }
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    if (files.some((f) => f.size > 400 * 1024)) {
      setStatus('Some gallery images are large and will be compressed; quality may be reduced.');
    }
  };

  const handleRemoveExistingImage = (idx) => {
    if (!Array.isArray(form.images)) return;
    const removed = form.images[idx];
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
    if (removed) setRemovedImages((prev) => [...prev, removed]);
  };

  const handleRemoveNewFile = (idx) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionVendor?.userId || !productId) {
      setStatus('You must be logged in as a vendor to edit products.');
      return;
    }
    setStatus('Saving...');

    let coverPath = form.cover_image;
    let galleryPaths = Array.isArray(form.images)
      ? form.images
      : (form.images || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    try {
      if (coverFile) {
        const { path } = await uploadImage(coverFile, 'products', 'Cover image');
        coverPath = path;
      }
      if (galleryFiles.length) {
        const uploads = await Promise.all(galleryFiles.map((f, idx) => uploadImage(f, 'products', `Image ${idx + 1}`)));
        galleryPaths = [...galleryPaths, ...uploads.map((u) => u.path)];
      }
      const keysToDelete = [];
      if (coverFile && originalCover) {
        const key = extractStorageKey(originalCover);
        if (key) keysToDelete.push(key);
      }
      if (removedImages.length) {
        removedImages.forEach((img) => {
          const k = extractStorageKey(img);
          if (k) keysToDelete.push(k);
        });
      }
      if (keysToDelete.length) {
        await fetch('/api/storage-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: keysToDelete }),
        }).catch(() => {});
      }
    } catch (err) {
      setStatus(err.message || 'Upload failed');
      return;
    }

    const payload = {
      id: productId,
      name: form.name,
      price: Number(form.price) || 0,
      main_category: form.main_category,
      subcategory: form.subcategory,
      cover_image: coverPath,
      images: galleryPaths,
      description: form.description,
      user_id: sessionVendor.userId,
      vendor_username: sessionVendor.username, // optional, for display convenience
    };

    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || 'Failed to save product');
      return;
    }

    await Promise.all([
      mutate('/api/products', undefined, { revalidate: true }),
      mutate('/api/profiles', undefined, { revalidate: true }),
    ]);

    const dest = `/profile/${sessionVendor.username}`;
    router.replace(dest);
    // Ensure fresh data after navigation
    setTimeout(() => router.refresh(), 80);
  };

  if (loading) {
    return <ProductFormSkeleton />;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={() => router.replace('/homepage')}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="page add-product-page">
      <div className="add-product-header">
        <button type="button" className="back-button" onClick={() => router.back()}>
          <img
            src={theme === 'clothing' ? '/icons/back.png' : '/icons/back-orange.png'}
            alt="Back"
            className="back-icon"
          />
        </button>
        <h1 className="add-product-title">Edit Product</h1>
      </div>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Price
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
        </label>

        <label>
          Main Category
          <select name="main_category" value={form.main_category} onChange={handleChange}>
            {mainCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subcategory
          <select name="subcategory" value={form.subcategory} onChange={handleChange}>
            {subOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cover Image
          <input
            ref={coverInputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={handleCoverFile}
          />
          <div className="file-actions-row">
            {!(coverFile || form.cover_image) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => coverInputRef.current?.click()}
              >
                Choose cover
              </button>
            )}
            {(coverFile || form.cover_image) && (
              <div className="file-list-item" style={{ alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                  {coverFile ? (
                    <img
                      src={URL.createObjectURL(coverFile)}
                      alt={coverFile.name}
                      className="file-thumb"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : form.cover_image ? (
                    <img
                      src={form.cover_image}
                      alt="Cover"
                      className="file-thumb"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : null}
                  <button
                    type="button"
                    className="profile-card-btn profile-card-delete file-remove-btn"
                    style={{ position: 'absolute', top: '-8px', right: '-8px' }}
                    onClick={() => { setCoverFile(null); setForm((prev) => ({ ...prev, cover_image: '' })); }}
                    aria-label="Remove cover"
                  >
                    <img src="/icons/delete.png" alt="Remove cover" className="profile-card-btn-icon" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </label>

        <label>
          Gallery Images (comma-separated)
          <input
            ref={galleryInputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFiles}
          />
          <div className="file-actions-row">
            {galleryFiles.length === 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => galleryInputRef.current?.click()}
              >
                Choose images
              </button>
            )}
            {galleryFiles.length > 0 && (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  Add more
                </button>
              </>
            )}
          </div>
          {Array.isArray(form.images) && form.images.length > 0 && (
            <ul className="file-list">
              {form.images.map((img, idx) => (
                <li key={`${img}-${idx}`} className="file-list-item">
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <img
                      src={img}
                      alt={img}
                      className="file-thumb"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      className="profile-card-btn profile-card-delete file-remove-btn"
                      style={{ position: 'absolute', top: '-8px', right: '-8px' }}
                      onClick={() => handleRemoveExistingImage(idx)}
                      aria-label="Remove image"
                    >
                      <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {galleryFiles.length > 0 && (
            <ul className="file-list">
              {galleryFiles.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="file-list-item">
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="file-thumb"
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      className="profile-card-btn profile-card-delete file-remove-btn"
                      style={{ position: 'absolute', top: '-8px', right: '-8px' }}
                      onClick={() => handleRemoveNewFile(idx)}
                      aria-label="Remove image"
                    >
                      <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </label>

        <label>
          Description
          <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
        </label>

        <button type="submit">Save changes</button>
        {status && (() => {
          const lower = String(status).toLowerCase();
          const isError = !(lower.startsWith('saving') || lower.includes('saved'));
          return (
            <p className={`form-status${isError ? ' is-error' : ''}`}>
              {status}
            </p>
          );
        })()}
      </form>
    </div>
      {cropCoverFile && (
        <CropperModal
          file={cropCoverFile}
          aspect={4 / 3}
          onCancel={() => setCropCoverFile(null)}
          onCropped={(cropped) => {
            setCoverFile(cropped);
            setCropCoverFile(null);
          }}
        />
      )}
    </>
  );
}
