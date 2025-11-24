'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '../../lib/uploadImage';
import { supabase } from '../../lib/supabaseClient';
import { useThemeIcons } from '../../lib/useThemeIcons';

const mainCategories = [
  { value: 'food', label: 'Food, Drinks, Snacks & Utensils' },
  { value: 'clothing', label: 'Clothing & accessories' },
];

// Subcategories as shown on the homepage
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

export default function AddProductPage() {
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
  const [productCount, setProductCount] = useState(0);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [galleryLimitOpen, setGalleryLimitOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { theme } = useThemeIcons('food');
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [sessionVendor, setSessionVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const subOptions = useMemo(() => subCategories[form.main_category] || [], [form.main_category]);

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
    // theme handled by useThemeIcons
    //

    async function loadSessionVendor() {
      setLoading(true);
      setError('');
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      if (!userId) {
        router.replace('/login');
        return;
      }
      try {
        const res = await fetch('/api/profiles');
        const profiles = res.ok ? await res.json() : [];
        const vendor = profiles.find((p) => p.userId === userId) || null;
        if (vendor) {
          setSessionVendor(vendor);
          try {
            const prodRes = await fetch('/api/products');
            const prodData = prodRes.ok ? await prodRes.json() : [];
            const mine = prodData.filter(
              (p) => (p.vendorUsername || p.vendor_username || p.vendor) === vendor.username
            );
            setProductCount(mine.length);
          } catch (_) {
            setProductCount(0);
          }
        } else {
          setError('No vendor profile found for this account.');
        }
      } catch (e) {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    }
    loadSessionVendor();
  }, []);

  // If limit reached, show the modal as soon as count is known
  useEffect(() => {
    if (productCount >= 20) {
      setLimitModalOpen(true);
      setStatus('You have reached the 20 product limit. Delete an existing product to add a new one.');
    }
  }, [productCount]);

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 400 * 1024) {
      alert('Max size is 400KB per image.');
      e.target.value = '';
      return;
    }
    setCoverFile(file);
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= 400 * 1024);
    if (valid.length !== files.length) {
      alert('Only image files up to 400KB are allowed.');
    }
    if (!valid.length) return;
    const current = galleryFiles.length;
    const available = Math.max(0, 3 - current);
    if (available <= 0) {
      setGalleryLimitOpen(true);
      return;
    }
    const toAdd = valid.slice(0, available);
    if (!toAdd.length) return;
    setGalleryFiles((prev) => [...prev, ...toAdd]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionVendor?.username) {
      setStatus('You must be logged in as a vendor to add products.');
      return;
    }
    if (productCount >= 20) {
      setStatus('You have reached the 20 product limit. Delete an existing product to add a new one.');
      setLimitModalOpen(true);
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
        const { path } = await uploadImage(coverFile, 'products');
        coverPath = path;
      }
      if (galleryFiles.length) {
        const uploads = await Promise.all(galleryFiles.map((f) => uploadImage(f, 'products')));
        galleryPaths = [...galleryPaths, ...uploads.map((u) => u.path)];
      }
    } catch (err) {
      setStatus(err.message || 'Upload failed');
      return;
    }

    const vendorUsername = sessionVendor?.username || '';
    const vendorUserId = sessionVendor?.userId || '';
    if (!vendorUsername || !vendorUserId) {
      setStatus('Missing vendor information. Please log in again.');
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price) || 0,
      main_category: form.main_category,
      subcategory: form.subcategory,
      vendor_username: vendorUsername,
      user_id: vendorUserId,
      cover_image: coverPath,
      images: galleryPaths,
      description: form.description,
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || 'Failed to save product');
      return;
    }

    setStatus('');
    setSuccessOpen(true);
    setForm({
      name: '',
      price: '',
      main_category: form.main_category,
      subcategory: subOptions[0]?.value || '',
      cover_image: '',
      images: '',
      description: '',
    });
    setCoverFile(null);
    setGalleryFiles([]);
  };

  const handleAddAnother = () => {
    setSuccessOpen(false);
  };

  const handleGoBack = () => {
    const uname = sessionVendor?.username || '';
    const slug = uname ? uname : '';
    window.location.href = slug ? `/profile/${slug}` : '/homepage';
  };

  if (loading) {
    return <div style={{ padding: '1.5rem' }}>Loadingâ€¦</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={() => router.replace('/login')}>
          Go to login
        </button>
      </div>
    );
  }

  return (
    <div className="page add-product-page">
      <div className="add-product-header">
        <button type="button" className="back-button" onClick={() => window.history.back()}>
          <img
            src={theme === 'clothing' ? '/icons/back.png' : '/icons/back-orange.png'}
            alt="Back"
            className="back-icon"
          />
        </button>
        <h1 className="add-product-title">Add Product</h1>
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
          Cover Image (path or URL)
          <input name="cover_image" value={form.cover_image} onChange={handleChange} />
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
          Gallery Images (Maximum 3 images)
          <input name="images" value={Array.isArray(form.images) ? form.images.join(', ') : form.images} onChange={handleChange} placeholder="img1.jpg, img2.jpg" />
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
                      onClick={() =>
                        setGalleryFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
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

        <button type="submit">Save product</button>
        {status && <p className="form-status">{status}</p>}
      </form>

      {limitModalOpen && (
        <div
          className="rating-overlay is-visible"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
          }}
        >
          <div className="rating-dialog" style={{ maxWidth: '320px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '6px' }}>Product limit reached</h2>
            <p className="rating-dialog-sub" style={{ marginBottom: '14px' }}>
              You can only have 20 products. Delete an existing product to add a new one.
            </p>
            <div className="rating-dialog-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button type="button" className="rating-confirm" onClick={() => setLimitModalOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {galleryLimitOpen && (
        <div
          className="rating-overlay is-visible"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
          }}
        >
          <div className="rating-dialog" style={{ maxWidth: '320px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '6px' }}>Image limit reached</h2>
            <p className="rating-dialog-sub" style={{ marginBottom: '14px' }}>
              You can only attach up to 3 images per product. Remove one to add another.
            </p>
            <div className="rating-dialog-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button type="button" className="rating-confirm" onClick={() => setGalleryLimitOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="add-product-success-overlay">
          <div className="add-product-success-dialog">
            <div className="success-icon">&#10003;</div>
            <h2>Product added!</h2>
            <p>Do you want to add another product or go back to your profile?</p>
            <div className="success-actions">
              <button type="button" className="btn-secondary" onClick={handleGoBack}>
                Go Back
              </button>
              <button type="button" className="btn-primary" onClick={handleAddAnother}>
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



