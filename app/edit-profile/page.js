"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSessionVendor } from "../../lib/useSessionVendor";
import { uploadImage } from "../../lib/uploadImage";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { supabase } from "../../lib/supabaseClient";

export default function EditProfilePage() {
  const router = useRouter();
  const { vendor, sessionUserId, loading } = useSessionVendor();
  const { theme } = useThemeIcons("clothing");

  const [form, setForm] = useState({
    username: "",
    shop_name: "",
    full_name: "",
    email: "",
    location: "",
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const prevProfileUrl = useRef(null);
  const prevBannerUrl = useRef(null);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const passwordSectionRef = useRef(null);
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
      setForm({
        username: vendor.username || "",
        shop_name: vendor.shopName || "",
        full_name: vendor.ownerName || "",
        email: vendor.email || "",
        location: vendor.location || "",
        whatsapp: vendor.whatsapp || "",
        instagram: vendor.instagram || "",
        motto: vendor.tagline || "",
        about_description: vendor.aboutDescription || "",
        profile_pic: vendor.avatar || "",
        banner_pic: vendor.banner || "",
      });
      setProfilePreview(vendor.avatar || "");
      setBannerPreview(vendor.banner || "");
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (file && file.size > 400 * 1024) {
      alert("Max size is 400KB per image.");
      e.target.value = "";
      return;
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
    if (file && file.size > 400 * 1024) {
      alert("Max size is 400KB per image.");
      e.target.value = "";
      return;
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

    let profilePath = form.profile_pic;
    let bannerPath = form.banner_pic;

    try {
      if (profileFile) {
        const { path } = await uploadImage(profileFile, "vendors");
        profilePath = path;
      }
      if (bannerFile) {
        const { path } = await uploadImage(bannerFile, "vendors");
        bannerPath = path;
      }
    } catch (err) {
      setStatus(err.message || "Upload failed");
      return;
    }

    const payload = {
      ...form,
      profile_pic: profilePath,
      banner_pic: bannerPath,
    };
    if (showPasswordFields) {
      payload.password = newPassword;
    }

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

    setStatus("Saved!");
    setTimeout(() => {
      router.replace(`/profile/${vendor.username}`);
    }, 600);
  };

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
              Change Email/Password
            </button>
          )}
          {showPasswordFields && (
            <div className="password-fields">
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
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
          Username (slug)
          <input name="username" value={form.username} onChange={handleChange} disabled />
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
        {status && <p className="form-status">{status}</p>}

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
