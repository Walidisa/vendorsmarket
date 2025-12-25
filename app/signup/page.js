'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { uploadImage } from '../../lib/uploadImage';
import { getInitialPreferences, resolveIcon } from '../../lib/themeUtils';
import { useThemeIcons } from '../../lib/useThemeIcons';

const initialForm = {
  username: '',
  shop_name: '',
  full_name: '',
  email: '',
  password: '',
  state: '',
  location: '',
  whatsapp: '',
  instagram: '',
  motto: '',
  about_description: '',
  profile_pic: '',
  banner_pic: '',
};

export default function SignupPage() {
  const states = [
    'Nigeria',
    'Abuja',
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
  ];
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
  const { theme: resolvedTheme } = useThemeIcons('clothing');
  const initialPrefs = useMemo(
    () => (typeof window === 'undefined' ? { theme: 'clothing', isDark: true } : getInitialPreferences('clothing')),
    []
  );
  const backIconSrc = resolveIcon('back', resolvedTheme || theme || initialPrefs.theme, initialPrefs.isDark);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [instagramError, setInstagramError] = useState(false);
  const [stateError, setStateError] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const usernameRef = useRef(null);
  const instagramRef = useRef(null);
  const stateRef = useRef(null);
  const CropperModal = dynamic(() => import('../components/ImageCropper').then(mod => mod.ImageCropper), { ssr: false });

  const formatWhatsApp = (val) => {
    const digits = (val || '').replace(/\D/g, '');
    if (!digits) return '+234 ';
    // Keep +234 default; if user typed a country code, respect the first 3 digits
    const country = digits.slice(0, 3) || '234';
    const rawRest = digits.slice(3); // everything after country code
    // Drop any leading zero(s) immediately after the country code, then cap to 10 digits
    const rest = rawRest.replace(/^0+/, '').slice(0, 10);
    const parts = [`+${country}`];
    if (rest.length) parts.push(rest.slice(0, 3));
    if (rest.length > 3) parts.push(rest.slice(3, 6));
    if (rest.length > 6) parts.push(rest.slice(6, 10));
    return parts.join(' ').trimEnd();
  };

  const sanitizeUsername = (val) => (val || '').replace(/\s+/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, '');

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
    const nextVal = name === 'username'
      ? sanitizeUsername(value)
      : name === 'instagram'
        ? value.replace(/\s+/g, '').replace(/^@+/, '').toLowerCase()
        : name === 'location'
          ? value.replace(/\s+/g, '')
          : name === 'email'
            ? value.replace(/\s+/g, '').toLowerCase()
            : value;
    if (name === 'username') setUsernameError(false);
    if (name === 'state') setStateError(false);
    if (name === 'instagram') setInstagramError(false);
    if (status) setStatus('');
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

  const preventSpaceKey = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
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
    setStatus('');
    setUsernameError(false);
    setPasswordError(false);
    setPasswordErrorMsg('');
    setTermsError(false);
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }

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

    const username = sanitizeUsername(form.username || '');
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

    if (!form.state) {
      setStatus('State is required.');
      setStateError(true);
      stateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const rawInstagram = (form.instagram || '').trim();
    const hasInstagramLink = rawInstagram && /https?:\/\//i.test(rawInstagram);
    if (hasInstagramLink) {
      setStatus('Enter an Instagram username only (not a link).');
      setInstagramError(true);
      instagramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const instagramHandle = rawInstagram ? rawInstagram.replace(/^@+/, '').toLowerCase() : '';

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
    const defaultProfile = 'vendors/default-pfp.jpg';
    const defaultBanner = '';

    try {
      if (profileFile) {
        const { path } = await uploadImage(profileFile, 'vendors', 'Profile image');
        profilePath = path;
      }
      if (!profileFile && !profilePath) {
        profilePath = defaultProfile;
      }
      if (bannerFile) {
        const { path } = await uploadImage(bannerFile, 'vendors', 'Banner image');
        bannerPath = path;
      }
      if (!bannerFile && !bannerPath) {
        bannerPath = defaultBanner;
      }
    } catch (err) {
      setStatus(err.message || 'Upload failed');
      return;
    }

    const trimmedLocation = (form.location || '').trim();
    const isNigeria = form.state && form.state.toLowerCase() === 'nigeria';
    const combinedLocation = trimmedLocation
      ? isNigeria ? trimmedLocation : `${trimmedLocation}, ${form.state} State`
      : isNigeria ? 'Nigeria' : `${form.state} State`;

    const payload = {
      ...form,
      location: combinedLocation,
      username,
      instagram: instagramHandle,
      whatsapp: formattedWhatsApp,
      profile_pic: profilePath,
      banner_pic: bannerPath,
      state: form.state,
    };

    setStatus('Saving');
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
            src={backIconSrc || (resolvedTheme === 'clothing' ? '/icons/back.png' : '/icons/back-orange.png')}
            alt="Back"
            className="back-icon"
            data-icon="back"
            data-blue="/icons/back.png"
            data-brown="/icons/back-orange.png"
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
            pattern="[a-z0-9_-]+"
            title="Only letters, numbers, dashes, and underscores"
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
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onKeyDown={preventSpaceKey}
            required
          />
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
          Location (Town / LGA)
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </label>
        <label>
          State
          <select
            ref={stateRef}
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className={stateError ? 'input-error' : ''}
          >
            <option value="">Select a state</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {stateError ? <div className="input-error-text">State is required.</div> : null}
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
          Instagram username (optional)
          <input
            ref={instagramRef}
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            className={instagramError ? 'input-error' : ''}
          />
          {instagramError ? <div className="input-error-text">Enter a username (no links).</div> : null}
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
          Profile Image
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
          Banner Image
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

        <label
          className="input-label"
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: 12,
            marginTop: 8
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (termsError && e.target.checked) {
                setTermsError(false);
                setStatus('');
              }
            }}
            required
            style={{
              marginTop: 2,
              outline: termsError ? '2px solid #b91c1c' : 'none',
              outlineOffset: 2,
              width: 18,
              height: 18
            }}
            onInvalid={(e) => {
              e.preventDefault();
              setTermsError(true);
              e.target.setCustomValidity('Please accept the Terms & Privacy to continue.');
            }}
            onInput={(e) => e.target.setCustomValidity('')}
          />
          <span>
            I have read and agree to the{' '}
            <Link href="/terms" style={{ textDecoration: 'underline' }}>
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {termsError ? (
          <div className="input-error-text" style={{ marginTop: 4 }}>
            Please accept the Terms &amp; Privacy to continue.
          </div>
        ) : null}

        <button type="submit">Create account</button>
          {status ? (() => {
            const s = status.trim().toLowerCase();
            const isNeutral = s.startsWith('saving') || s.startsWith('signing') || s.startsWith('creating');
            return (
            <p className={`form-status${isNeutral ? '' : ' is-error'}`}>
                {status}
                {s.startsWith('saving') || s.startsWith('signing') || s.startsWith('creating') ? (
                  <span className="loading-dots" aria-hidden="true"></span>
                ) : null}
              </p>
            );
          })() : null}
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
