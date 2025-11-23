'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { uploadImage } from '../../lib/uploadImage';

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
    { value: 'materials', label: 'Textiles & Fabrics' },
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
  const [successOpen, setSuccessOpen] = useState(false);
  const [theme, setTheme] = useState('food');
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
    const t = typeof window !== 'undefined' ? (localStorage.getItem('activeTheme') || 'food') : 'food';
    setTheme(t);
  }, []);

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryFiles((prev) => [...prev, ...files]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const vendorUsername = localStorage.getItem('loggedInVendorUsername') || '';

    const payload = {
      name: form.name,
      price: Number(form.price) || 0,
      main_category: form.main_category,
      subcategory: form.subcategory,
      vendor_username: vendorUsername,
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
    const uname = localStorage.getItem('loggedInVendorUsername') || '';
    const slug = uname ? uname : '';
    window.location.href = slug ? `/profile/${slug}` : '/homepage';
  };

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
              <>
                <span className="file-name">
                  {coverFile?.name || form.cover_image}
                </span>
                <button
                  type="button"
                  className="profile-card-btn profile-card-delete file-remove-btn"
                  onClick={() => { setCoverFile(null); setForm((prev) => ({ ...prev, cover_image: '' })); }}
                  aria-label="Remove cover"
                >
                  <img src="/icons/delete.png" alt="Remove cover" className="profile-card-btn-icon" />
                </button>
              </>
            )}
          </div>
        </label>

        <label>
          Gallery Images (comma-separated)
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
                <li key={`${file.name}-${idx}`}>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="profile-card-btn profile-card-delete file-remove-btn"
                    onClick={() =>
                      setGalleryFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    aria-label="Remove image"
                  >
                    <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
                  </button>
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

      {successOpen && (
        <div className="add-product-success-overlay">
          <div className="add-product-success-dialog">
            <div className="success-icon">✔</div>
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
