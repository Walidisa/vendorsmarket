'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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
  const [theme, setTheme] = useState('clothing');
  const [status, setStatus] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const passwordRef = useRef(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const prevProfileUrl = useRef(null);
  const prevBannerUrl = useRef(null);
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [cropProfileFile, setCropProfileFile] = useState(null);
  const [cropBannerFile, setCropBannerFile] = useState(null);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const usernameRef = useRef(null);
  const CropperModal = dynamic(() => import('../components/ImageCropper').then(mod => mod.ImageCropper), { ssr: false });

  const formatWhatsApp = (val) => {
    const digits = (val || '').replace(/\D/g, '');
    if (!digits) return '+234 ';
    // Keep +234 default; if user typed a country code, respect the first 3 digits
    const country = digits.slice(0, 3) || '234';
    const rest = digits.slice(3, 13); // up to 10 more digits
    const parts = [`+${country}`];
    if (rest.length) parts.push(rest.slice(0, 3));
    if (rest.length > 3) parts.push(rest.slice(3, 6));
    if (rest.length > 6) parts.push(rest.slice(6, 10));
    return parts.join(' ').trimEnd();
  };

  useEffect(() => {
    const t = typeof window !== 'undefined' ? (localStorage.getItem('activeTheme') || 'clothing') : 'clothing';
    setTheme(t);
  }, []);

  useEffect(() => {
    if (!profileFile && form.profile_pic) {
      setProfilePreview(form.profile_pic);
    } else if (!profileFile && !form.profile_pic) {
      setProfilePreview('');
    }
  }, [profileFile, form.profile_pic]);

  useEffect(() => {
    if (!bannerFile && form.banner_pic) {
      setBannerPreview(form.banner_pic);
    } else if (!bannerFile && !form.banner_pic) {
      setBannerPreview('');
    }
  }, [bannerFile, form.banner_pic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextVal = name === 'username' ? value.replace(/\s+/g, '').toLowerCase() : value;
    if (name === 'username') setUsernameError(false);
    if (name === 'location') setLocationError(false);
    if (name === 'whatsapp') {
      const formatted = formatWhatsApp(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: nextVal }));
  };

  const handleWhatsAppFocus = () => {
    if (!(form.whatsapp || '').trim()) {
      setForm((prev) => ({ ...prev, whatsapp: '+234 ' }));
    }
  };

  const handleProfileFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Max size is 5MB per image.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 400 * 1024) {
      setStatus('Profile image is large and will be compressed; quality may be reduced.');
    }
    setCropProfileFile(file);
  };

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Max size is 5MB per image.');
      e.target.value = '';
      return;
    }
    if (file && file.size > 400 * 1024) {
      setStatus('Banner image is large and will be compressed; quality may be reduced.');
    }
    setCropBannerFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    setUsernameError(false);
    setLocationError(false);
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

    const username = (form.username || '').trim().toLowerCase();
    if (!username) {
      setStatus('Username is required.');
      setUsernameError(true);
      usernameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formattedWhatsApp = formatWhatsApp(form.whatsapp);
    const whatsappDigits = formattedWhatsApp.replace(/\D/g, '');
    if (!whatsappDigits) {
      setStatus('WhatsApp number is required.');
      return;
    }
    if (whatsappDigits.length < 10) {
      setStatus('Enter a valid WhatsApp number in the format +234 000 000 0000.');
      return;
    }

    if (!(form.location || '').trim()) {
      setStatus('Location is required.');
      setLocationError(true);
      return;
    }

    try {
      const availabilityRes = await fetch('/api/profiles', { cache: 'no-store' });
      if (!availabilityRes.ok) {
        setStatus('Unable to check username availability. Please try again.');
        return;
      }
      const profiles = await availabilityRes.json();
      const taken = Array.isArray(profiles) && profiles.some((p) => (p.username || '').toLowerCase() === username.toLowerCase());
      if (taken) {
        setStatus('Username already taken. Please choose another.');
        setUsernameError(true);
        usernameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    } catch (_) {
      setStatus('Unable to check username availability. Please try again.');
      return;
    }

    let profilePath = form.profile_pic;
    let bannerPath = form.banner_pic;

    try {
      if (profileFile) {
        const { path } = await uploadImage(profileFile, 'vendors', 'Profile image');
        profilePath = path;
      }
      if (bannerFile) {
        const { path } = await uploadImage(bannerFile, 'vendors', 'Banner image');
        bannerPath = path;
      }
    } catch (err) {
      setStatus(err.message || 'Upload failed');
      return;
    }

    const payload = {
      ...form,
      username,
      whatsapp: formattedWhatsApp,
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
          Username
          <input
            ref={usernameRef}
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className={usernameError ? 'input-error' : ''}
          />
          {usernameError ? <div className="input-error-text">Username taken. Try another one.</div> : null}
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
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className={locationError ? 'input-error' : ''}
          />
          {locationError ? <div className="input-error-text">Location is required.</div> : null}
        </label>
        <label>
          WhatsApp
          <input
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            required
            inputMode="tel"
            placeholder="+234 000 000 0000"
            onFocus={handleWhatsAppFocus}
            title="Format: +234 000 000 0000"
          />
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
          {profilePreview ? (
            <div className="signup-image-preview square">
              <img src={profilePreview} alt="Profile preview" />
              <button
                type="button"
                className="preview-delete-btn"
                onClick={() => {
                  if (prevProfileUrl.current && prevProfileUrl.current.startsWith('blob:')) {
                    URL.revokeObjectURL(prevProfileUrl.current);
                  }
                  prevProfileUrl.current = null;
                  setProfilePreview('');
                  setProfileFile(null);
                  setForm((prev) => ({ ...prev, profile_pic: '' }));
                }}
                aria-label="Remove profile image"
              >
                <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
              </button>
            </div>
          ) : null}
          <div className="file-actions-row">
            {!profileFile && !form.profile_pic && (
              <button type="button" className="btn-secondary" onClick={() => profileInputRef.current?.click()}>
                Choose profile
              </button>
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
          {bannerPreview ? (
            <div className="signup-image-preview wide">
              <img src={bannerPreview} alt="Banner preview" />
              <button
                type="button"
                className="preview-delete-btn"
                onClick={() => {
                  if (prevBannerUrl.current && prevBannerUrl.current.startsWith('blob:')) {
                    URL.revokeObjectURL(prevBannerUrl.current);
                  }
                  prevBannerUrl.current = null;
                  setBannerPreview('');
                  setBannerFile(null);
                  setForm((prev) => ({ ...prev, banner_pic: '' }));
                }}
                aria-label="Remove banner image"
              >
                <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
              </button>
            </div>
          ) : null}
          <div className="file-actions-row">
            {!bannerFile && !form.banner_pic && (
              <button type="button" className="btn-secondary" onClick={() => bannerInputRef.current?.click()}>
                Choose banner
              </button>
            )}
          </div>
        </label>

        <button type="submit">Create account</button>
        {status ? (
          <p
            className={`form-status${
              (() => {
                const s = status.toLowerCase();
                return s.startsWith('saving') || s.startsWith('signing') ? '' : ' is-error';
              })()
            }`}
          >
            {status}
          </p>
        ) : null}
      </form>

            {successOpen && (
        <div className="add-product-success-overlay">
          <div className="add-product-success-dialog">
            <div className="success-icon">✅</div>
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

      {cropProfileFile && (
        <CropperModal
          file={cropProfileFile}
          aspect={1}
          onCancel={() => setCropProfileFile(null)}
          onCropped={(cropped) => {
            setProfileFile(cropped);
            if (prevProfileUrl.current && prevProfileUrl.current.startsWith('blob:')) {
              URL.revokeObjectURL(prevProfileUrl.current);
            }
            const url = URL.createObjectURL(cropped);
            prevProfileUrl.current = url;
            setProfilePreview(url);
            setCropProfileFile(null);
          }}
        />
      )}

      {cropBannerFile && (
        <CropperModal
          file={cropBannerFile}
          aspect={16 / 9}
          onCancel={() => setCropBannerFile(null)}
          onCropped={(cropped) => {
            setBannerFile(cropped);
            if (prevBannerUrl.current && prevBannerUrl.current.startsWith('blob:')) {
              URL.revokeObjectURL(prevBannerUrl.current);
            }
            const url = URL.createObjectURL(cropped);
            prevBannerUrl.current = url;
            setBannerPreview(url);
            setCropBannerFile(null);
          }}
        />
      )}
    </div>
  );
}
