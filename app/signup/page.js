'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadImage } from '../../lib/uploadImage';

const initialForm = {
  username: '',
  shop_name: '',
  full_name: '',
  email: '',
  password: '',
  location: '',
  whatsapp: '',
  instagram: '',
  motto: '',
  about_description: '',
  profile_pic: '',
  banner_pic: '',
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState('food');
  const [status, setStatus] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const passwordRef = useRef(null);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  useEffect(() => {
    const t = typeof window !== 'undefined' ? (localStorage.getItem('activeTheme') || 'food') : 'food';
    setTheme(t);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileFile = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
  };

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    setPasswordError(false);
    setPasswordErrorMsg('');

    if (form.password !== confirmPassword) {
      setStatus('Passwords do not match');
      setPasswordError(true);
      setPasswordErrorMsg('Passwords do not match');
      passwordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());
    if (!emailOk) {
      setStatus('Please enter a valid email address.');
      return;
    }

    let profilePath = form.profile_pic;
    let bannerPath = form.banner_pic;

    try {
      if (profileFile) {
        const { path } = await uploadImage(profileFile, 'vendors');
        profilePath = path;
      }
      if (bannerFile) {
        const { path } = await uploadImage(bannerFile, 'vendors');
        bannerPath = path;
      }
    } catch (err) {
      setStatus(err.message || 'Upload failed');
      return;
    }

    const payload = {
      ...form,
      profile_pic: profilePath,
      banner_pic: bannerPath,
    };

    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || 'Signup failed');
      return;
    }

    setStatus('');
    setSuccessOpen(true);
    setForm(initialForm);
    setConfirmPassword('');
    setProfileFile(null);
    setBannerFile(null);
  };

  const handleGoLogin = () => {
    window.location.href = '/login';
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
        <h1 className="add-product-title">Become a Vendor</h1>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>
          Username (slug)
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          Shop Name
          <input name="shop_name" value={form.shop_name} onChange={handleChange} />
        </label>
        <label>
          Full Name
          <input name="full_name" value={form.full_name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className={passwordError ? 'input-error' : ''}
            ref={passwordRef}
          />
        </label>
        <label>
          Confirm Password
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={passwordError ? 'input-error' : ''}
          />
          {passwordErrorMsg ? <div className="input-error-text">{passwordErrorMsg}</div> : null}
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} />
        </label>
        <label>
          Instagram (optional)
          <input name="instagram" value={form.instagram} onChange={handleChange} />
        </label>
        <label>
          Motto (optional)
          <input name="motto" value={form.motto} onChange={handleChange} />
        </label>
        <label>
          About (optional)
          <textarea name="about_description" rows="3" value={form.about_description} onChange={handleChange} />
        </label>

        <label>
          Profile Image (path or URL)
          <input name="profile_pic" value={form.profile_pic} onChange={handleChange} />
          <input
            ref={profileInputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={handleProfileFile}
          />
          <div className="file-actions-row">
            {!profileFile && !form.profile_pic && (
              <button type="button" className="btn-secondary" onClick={() => profileInputRef.current?.click()}>
                Choose profile
              </button>
            )}
            {(profileFile || form.profile_pic) && (
              <>
                <span className="file-name">{profileFile?.name || form.profile_pic}</span>
                <button
                  type="button"
                  className="profile-card-btn profile-card-delete file-remove-btn"
                  onClick={() => {
                    setProfileFile(null);
                    setForm((prev) => ({ ...prev, profile_pic: '' }));
                  }}
                  aria-label="Remove profile image"
                >
                  <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
                </button>
              </>
            )}
          </div>
        </label>

        <label>
          Banner Image (path or URL)
          <input name="banner_pic" value={form.banner_pic} onChange={handleChange} />
          <input
            ref={bannerInputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={handleBannerFile}
          />
          <div className="file-actions-row">
            {!bannerFile && !form.banner_pic && (
              <button type="button" className="btn-secondary" onClick={() => bannerInputRef.current?.click()}>
                Choose banner
              </button>
            )}
            {(bannerFile || form.banner_pic) && (
              <>
                <span className="file-name">{bannerFile?.name || form.banner_pic}</span>
                <button
                  type="button"
                  className="profile-card-btn profile-card-delete file-remove-btn"
                  onClick={() => {
                    setBannerFile(null);
                    setForm((prev) => ({ ...prev, banner_pic: '' }));
                  }}
                  aria-label="Remove banner image"
                >
                  <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
                </button>
              </>
            )}
          </div>
        </label>

        <button type="submit">Create account</button>
        {status && <p className="form-status">{status}</p>}
      </form>

      {successOpen && (
        <div className="add-product-success-overlay">
          <div className="add-product-success-dialog">
            <div className="success-icon">✓</div>
            <h2>Account created!</h2>
            <p>You can now log in and start adding products.</p>
            <div className="success-actions">
              <button type="button" className="btn-primary" onClick={handleGoLogin}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
