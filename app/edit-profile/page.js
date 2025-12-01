"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSessionVendor } from "../../lib/useSessionVendor";
import { uploadImage } from "../../lib/uploadImage";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { supabase } from "../../lib/supabaseClient";
import { STORAGE_BUCKET } from "../../lib/storage";

const extractStorageKey = (url) => {
  if (!url) return null;
  let key = String(url).trim();
  if (!key) return null;
  // Drop query/hash
  if (key.includes('?')) key = key.split('?')[0];
  if (key.includes('#')) key = key.split('#')[0];
  if (key.startsWith("http")) {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const idx = key.indexOf(marker);
    if (idx === -1) return null;
    key = key.slice(idx + marker.length);
  }
  if (key.startsWith(`${STORAGE_BUCKET}/`)) key = key.replace(`${STORAGE_BUCKET}/`, "");
  if (key.startsWith("/")) key = key.slice(1);
  return key || null;
};

const formatWhatsApp = (val) => {
  const digits = (val || "").replace(/\D/g, "");
  if (!digits) return "+234 ";
  const country = digits.slice(0, 3) || "234";
  const rawRest = digits.slice(3);
  const rest = rawRest.replace(/^0+/, "").slice(0, 10);
  const parts = [`+${country}`];
  if (rest.length) parts.push(rest.slice(0, 3));
  if (rest.length > 3) parts.push(rest.slice(3, 6));
  if (rest.length > 6) parts.push(rest.slice(6, 10));
  return parts.join(" ").trimEnd();
};

const sanitizeUsername = (val) => (val || "").replace(/\s+/g, "").toLowerCase().replace(/[^a-z0-9_-]/g, "");

export default function EditProfilePage() {
  const router = useRouter();
  const { vendor, sessionUserId, loading } = useSessionVendor();
  const { theme } = useThemeIcons("clothing");

  const states = [
    'Nigeria',
    "Abuja",
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const [form, setForm] = useState({
    username: "",
    shop_name: "",
    full_name: "",
    email: "",
    location: "",
    state: "",
    whatsapp: "",
    instagram: "",
    motto: "",
    about_description: "",
    profile_pic: "",
    banner_pic: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [status, setStatus] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [cropProfileFile, setCropProfileFile] = useState(null);
  const [cropBannerFile, setCropBannerFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [instagramError, setInstagramError] = useState(false);
  const [originalProfilePic, setOriginalProfilePic] = useState("");
  const [originalBannerPic, setOriginalBannerPic] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stateError, setStateError] = useState(false);
  const prevProfileUrl = useRef(null);
  const prevBannerUrl = useRef(null);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const passwordSectionRef = useRef(null);
  const instagramRef = useRef(null);
  const usernameRef = useRef(null);
  const stateRef = useRef(null);
  const CropperModal = dynamic(() => import("../components/ImageCropper").then((mod) => mod.ImageCropper), {
    ssr: false,
  });

  useEffect(() => {
    if (!loading && !vendor) {
      router.replace("/login");
    }
  }, [loading, vendor, router]);

  useEffect(() => {
    if (vendor) {
      const profilePic = vendor.avatar || "";
      const bannerPic = vendor.banner || "";
      let stateValue = "";
      let loc = vendor.location || "";
      if (loc) {
        const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
        if (parts.length) {
          const possibleState = parts[parts.length - 1].replace(/state$/i, "").trim();
          if (states.some((s) => s.toLowerCase() === possibleState.toLowerCase())) {
            stateValue = states.find((s) => s.toLowerCase() === possibleState.toLowerCase()) || "";
            if (parts.length > 1) {
              parts.pop();
              loc = parts.join(", ");
            } else {
              loc = "";
            }
          }
        }
      }
      setForm({
        username: vendor.username || "",
        shop_name: vendor.shopName || "",
        full_name: vendor.ownerName || "",
        email: vendor.email || "",
        location: loc || "",
        state: stateValue || "",
        whatsapp: vendor.whatsapp || "",
        instagram: vendor.instagram || "",
        motto: vendor.tagline || "",
        about_description: vendor.aboutDescription || "",
        profile_pic: profilePic,
        banner_pic: bannerPic,
      });
      const isDefaultProfile =
        profilePic.includes('default-pfp') || profilePic.includes('default-seller');
      setProfilePreview(isDefaultProfile ? "" : profilePic);
      setBannerPreview(bannerPic || "");
      setOriginalProfilePic(profilePic);
      setOriginalBannerPic(bannerPic);
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setForm((prev) => ({ ...prev, username: sanitizeUsername(value) }));
      return;
    }
    if (name === "whatsapp") {
      setForm((prev) => ({ ...prev, whatsapp: formatWhatsApp(value) }));
      return;
    }
    if (name === "state") {
      setStateError(false);
      setForm((prev) => ({ ...prev, state: value }));
      return;
    }
    if (name === "instagram") {
      setInstagramError(false);
      setStatus("");
      setForm((prev) => ({
        ...prev,
        instagram: value.replace(/\s+/g, "").replace(/^@+/, "").toLowerCase(),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Max size is 5MB per image.");
      e.target.value = "";
      return;
    }
    if (file && file.size > 400 * 1024) {
      setStatus("Profile image is large and will be compressed; quality may be reduced.");
    }
    setCropProfileFile(file);
  };

  const handleBannerFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Max size is 5MB per image.");
      e.target.value = "";
      return;
    }
    if (file && file.size > 400 * 1024) {
      setStatus("Banner image is large and will be compressed; quality may be reduced.");
    }
    setCropBannerFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");

    if (!vendor?.username) {
      setStatus("No vendor to update.");
      return;
    }

    setPasswordError("");
    if (showPasswordFields) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError("Please fill all password fields.");
        passwordSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (newPassword === currentPassword) {
        setPasswordError("New password cannot match current password.");
        passwordSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        passwordSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    const rawInstagram = (form.instagram || "").trim();
    if (rawInstagram && /https?:\/\//i.test(rawInstagram)) {
      setStatus("Enter an Instagram username only (not a link).");
      setInstagramError(true);
      instagramRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let profilePath = form.profile_pic;
    let bannerPath = form.banner_pic;
    const bannerSourceForDelete =
      !bannerFile && !bannerPath
        ? (form.banner_pic || originalBannerPic || vendor?.banner || "")
        : "";
    const bannerKeyToDelete = extractStorageKey(bannerSourceForDelete);
    const defaultProfile = 'vendors/default-pfp.jpg';
    const defaultBanner = ''; // no forced default banner

    try {
      if (profileFile) {
        const { path } = await uploadImage(profileFile, "vendors", "Profile image");
        profilePath = path;
      }
      if (!profileFile && !profilePath) {
        profilePath = defaultProfile;
      }
      if (bannerFile) {
        const { path } = await uploadImage(bannerFile, "vendors", "Banner image");
        bannerPath = path;
      }
      const keysToDelete = [];
      if (bannerKeyToDelete) keysToDelete.push(bannerKeyToDelete);
      const profileKey = profileFile && originalProfilePic ? extractStorageKey(originalProfilePic) : null;
      if (profileKey && !profileKey.includes('default-pfp')) keysToDelete.push(profileKey);
      const bannerReplaceKey = bannerFile && originalBannerPic ? extractStorageKey(originalBannerPic) : null;
      if (bannerReplaceKey && !bannerReplaceKey.includes('default-banner')) keysToDelete.push(bannerReplaceKey);
      if (keysToDelete.length) {
        await fetch('/api/storage-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: keysToDelete }),
        }).catch(() => {});
      }

      // Update originals so subsequent edits know current values
      setOriginalProfilePic(profilePath || "");
      setOriginalBannerPic(bannerPath || "");
    } catch (err) {
      setStatus(err.message || "Upload failed");
      return;
    }

    const payload = {
      ...form,
      instagram: rawInstagram,
      profile_pic: profilePath || (profilePreview ? profilePreview : ""),
      banner_pic: bannerPath || "",
    };
    if (showPasswordFields) {
      payload.password = newPassword;
    }

    // Validation similar to signup hygiene
    const username = sanitizeUsername(payload.username || "");
    if (!username) {
      setStatus("Username is required.");
      usernameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    payload.username = username;

    const emailVal = (payload.email || "").trim();
    if (emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)) {
      setStatus("Please enter a valid email address.");
      return;
    }

    const rawInsta = (payload.instagram || "").trim();
    if (rawInsta && /https?:\/\//i.test(rawInsta)) {
      setStatus("Enter an Instagram username only (not a link).");
      setInstagramError(true);
      instagramRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    payload.instagram = rawInsta ? rawInsta.replace(/^@+/, "").toLowerCase() : "";
    payload.whatsapp = formatWhatsApp(payload.whatsapp);

    if (!payload.state) {
      setStateError(true);
      setStatus("State is required.");
      stateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const trimmedLocation = (payload.location || "").trim();
    const isNigeria = payload.state && payload.state.toLowerCase() === "nigeria";
    payload.location = trimmedLocation
      ? isNigeria ? trimmedLocation : `${trimmedLocation}, ${payload.state} State`
      : isNigeria ? "Nigeria" : `${payload.state} State`;

    // include auth token so the API can verify ownership
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      setStatus("No active session. Please log in again.");
      return;
    }

    const res = await fetch(`/api/vendors/${vendor.username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus(body.error || "Update failed");
      return;
    }

    const payloadRes = await res.json().catch(() => ({}));
    const nextUsername = payloadRes.username || form.username || vendor.username;
    setStatus("Saved!");
    setTimeout(() => {
      router.replace(`/profile/${nextUsername}`);
    }, 600);
  };

  const isDefaultProfilePic =
    form.profile_pic &&
    form.profile_pic.includes('default-pfp');

  return (
    <div className="page add-product-page">
      <div className="add-product-header">
        <button type="button" className="back-button" onClick={() => window.history.back()}>
          <img
            src={theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png"}
            alt="Back"
            className="back-icon"
          />
        </button>
        <h1 className="add-product-title">Edit Profile</h1>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div ref={passwordSectionRef} className="password-toggle-block">
          {!showPasswordFields && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowPasswordFields(true);
                setPasswordError("");
              }}
            >
              Change Password
            </button>
          )}
          {showPasswordFields && (
            <div className="password-fields">
              <label>
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={passwordError ? "input-error" : ""}
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={passwordError ? "input-error" : ""}
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={passwordError ? "input-error" : ""}
                />
              </label>
              {passwordError && <p className="input-error-text">{passwordError}</p>}
              <div className="file-actions-row" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    if (vendor?.email) {
                      setForm((prev) => ({ ...prev, email: vendor.email }));
                    }
                  }}
                >
                  Cancel password change
                </button>
              </div>
            </div>
          )}
        </div>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required={false}
          />
        </label>

        <label>
          Username
          <input
            ref={usernameRef}
            name="username"
            value={form.username}
            onChange={handleChange}
            pattern="[a-z0-9_-]+"
            title="Only letters, numbers, dashes, and underscores"
            required
          />
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
            className={stateError ? "input-error" : ""}
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
          Shop Name
          <input name="shop_name" value={form.shop_name} onChange={handleChange} />
        </label>
        <label>
          Full Name
          <input name="full_name" value={form.full_name} onChange={handleChange} />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} />
        </label>
        <label>
          Instagram (optional)
          <input
            ref={instagramRef}
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            className={instagramError ? "input-error" : ""}
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
                  if (prevProfileUrl.current && prevProfileUrl.current.startsWith("blob:")) {
                    URL.revokeObjectURL(prevProfileUrl.current);
                  }
                  prevProfileUrl.current = null;
                  setProfilePreview("");
                  setProfileFile(null);
                  setForm((prev) => ({ ...prev, profile_pic: "" }));
                }}
                aria-label="Remove profile image"
              >
                <img src="/icons/delete.png" alt="Remove" className="profile-card-btn-icon" />
              </button>
            </div>
          ) : null}
          <div className="file-actions-row">
            {!profileFile && (!form.profile_pic || isDefaultProfilePic) && (
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
                  if (prevBannerUrl.current && prevBannerUrl.current.startsWith("blob:")) {
                    URL.revokeObjectURL(prevBannerUrl.current);
                  }
                  prevBannerUrl.current = null;
                  setBannerPreview("");
                  setBannerFile(null);
                  setForm((prev) => ({ ...prev, banner_pic: "" }));
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

        <div className="profile-logout-wrapper" style={{ marginTop: "16px" }}>
          <button
            type="button"
            className="profile-logout-btn"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </form>

      {deleteModalOpen && (
        <div
          className="rating-overlay is-visible"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
        >
          <div className="rating-dialog" style={{ maxWidth: "320px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "6px" }}>Delete account?</h2>
            <p className="rating-dialog-sub" style={{ marginBottom: "14px" }}>
              This will delete your profile, all of your products, and your stored information. This cannot be undone.
            </p>
            <div className="rating-dialog-actions" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button type="button" className="rating-cancel" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rating-confirm"
                style={{ background: "#d6453d" }}
                onClick={async () => {
                  if (!vendor?.username) return;
                  setStatus("Deleting account...");
                  try {
                    // Refresh session to avoid stale token
                    await supabase.auth.refreshSession().catch(() => {});
                    const {
                      data: sessionData,
                    } = await supabase.auth.getSession();
                    const accessToken = sessionData?.session?.access_token;
                    if (!accessToken) {
                      setStatus("No active session; please log in again.");
                      setDeleteModalOpen(false);
                      return;
                    }
                    const res = await fetch(`/api/vendors/${vendor.username}`, {
                      method: "DELETE",
                      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
                    });
                    if (!res.ok) {
                      if (res.status === 401) {
                        setStatus("Session expired. Please log in again.");
                        setDeleteModalOpen(false);
                        router.replace("/login");
                        return;
                      }
                      const body = await res.json().catch(() => ({}));
                      setStatus(body.error || "Delete failed");
                      setDeleteModalOpen(false);
                      return;
                    }
                    await supabase.auth.signOut({ scope: "global" }).catch(() => supabase.auth.signOut().catch(() => {}));
                    if (typeof window !== "undefined") {
                      Object.keys(localStorage).forEach((k) => {
                        if (k.toLowerCase().includes("supabase")) localStorage.removeItem(k);
                      });
                      window.location.href = "/homepage";
                    } else {
                      router.replace("/homepage");
                    }
                  } catch (err) {
                    setStatus(err.message || "Delete failed");
                  } finally {
                    setDeleteModalOpen(false);
                  }
                }}
              >
                Delete
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
            if (prevProfileUrl.current && prevProfileUrl.current.startsWith("blob:")) {
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
            if (prevBannerUrl.current && prevBannerUrl.current.startsWith("blob:")) {
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


