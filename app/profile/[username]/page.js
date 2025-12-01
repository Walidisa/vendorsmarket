"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { useSessionVendor } from "../../../lib/useSessionVendor";
import { useProfiles, useProducts, useFeedback } from "../../../lib/useData";
import { useThemeIcons } from "../../../lib/useThemeIcons";
import { ProductCard } from "../../components/ProductCard";
import { AddProductCard } from "../../components/AddProductCard";
import { FeedbackList } from "../../components/FeedbackList";
import { RatingModal } from "../../components/RatingModal";
import { slugify } from "../../components/slugify";

function ProfileSkeleton() {
  return (
    <div className="page-transition">
      <div className="page">
        <section className="profile-header">
          <div className="profile-banner skeleton skeleton-banner"></div>
          <div className="profile-info-row skeleton-info-row">
            <div className="profile-avatar-left skeleton skeleton-circle"></div>
            <div className="profile-info-text skeleton-stack" style={{ padding: 0, gap: 12 }}>
              <div className="skeleton skeleton-line skeleton-line-row1"></div>
              <div className="skeleton skeleton-line skeleton-line-row2"></div>
              <div className="skeleton skeleton-line skeleton-line-row3"></div>
              <div className="skeleton skeleton-line skeleton-line-row4"></div>
            </div>
          </div>
        </section>

        <div className="profile-tabs skeleton-tabs">
          <div className="skeleton skeleton-pill skeleton-pill-wide"></div>
          <div className="skeleton skeleton-pill skeleton-pill-wide"></div>
        </div>

        <section className="profile-products">
          <div className="profile-products-grid skeleton-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="skeleton-card-wrapper">
                <div className="skeleton skeleton-card skeleton-card-small"></div>
                <div className="skeleton skeleton-line skeleton-line-small"></div>
                <div className="skeleton skeleton-line skeleton-line-smaller"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage({ params }) {
  const router = useRouter();
  const usernameSlug = (params?.username || "").toLowerCase();

  const [profile, setProfile] = useState(null);
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const loading = false;
  const [error, setError] = useState("");
  const [tab, setTab] = useState("products");
  const [isOwner, setIsOwner] = useState(false);
  const { theme } = useThemeIcons("clothing");

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const { sessionUserId, vendor: sessionVendor } = useSessionVendor();
  const { profiles, isLoading: profilesLoading, error: profilesError } = useProfiles();
  const { products: allProducts, isLoading: productsLoading, error: productsError } = useProducts();
  const { feedback: feedbackData, isLoading: feedbackLoading, error: feedbackError } = useFeedback();

  useEffect(() => {
    if (profile && sessionUserId) {
      setIsOwner(!!(profile.userId && sessionUserId === profile.userId));
    } else {
      setIsOwner(false);
    }
  }, [profile, sessionUserId]);

  useEffect(() => {
    const foundProfile =
      profiles.find((p) => {
        const u = (p.username || "").toLowerCase();
        const s = slugify(p.username || p.id || "");
        return u === usernameSlug || s === usernameSlug;
      }) || null;
    setProfile(foundProfile || null);
  }, [profiles, usernameSlug]);

  useEffect(() => {
    if (!profile) {
      setOwnedProducts([]);
      return;
    }
    const owned = allProducts.filter((p) => {
      const ownerId = p.ownerUserId || p.vendorUserId || p.user_id;
      if (profile.userId && ownerId) return ownerId === profile.userId;
      return slugify(p.vendorUsername || p.vendor || "") === slugify(profile.username || "");
    });
    setOwnedProducts(owned);
  }, [allProducts, profile]);

  useEffect(() => {
    if (!profile) {
      setFeedbackList([]);
      return;
    }
    const vendorFeedback = feedbackData.filter((f) => {
      const sellerId = f.sellerId || f.vendorUserId || f.vendor_user_id;
      if (profile.userId && sellerId) return sellerId === profile.userId;
      return slugify(f.vendorUsername || f.sellerName || "") === slugify(profile.username || "");
    });
    setFeedbackList(vendorFeedback);
  }, [feedbackData, profile]);

  const avgRating = useMemo(() => {
    const vals = feedbackList.map((f) => Number(f.rating) || 0);
    if (!vals.length) return { value: null, count: 0 };
    const total = vals.reduce((s, v) => s + v, 0);
    return { value: total / vals.length, count: vals.length };
  }, [feedbackList]);

  const whatsappNumber = (profile?.whatsapp || "").replace(/\D/g, "");
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const instagramRaw = (profile?.instagram || "").trim();
  const instagramHandle = instagramRaw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .toLowerCase();
  const instagramHref = instagramHandle ? `https://instagram.com/${instagramHandle}` : null;
  const bannerSrc =
    profile?.banner &&
    profile.banner !== "null" &&
    profile.banner !== "undefined"
      ? profile.banner
      : null;
  const avatarSrc =
    profile?.avatar && profile.avatar !== "null" && profile.avatar !== "undefined"
      ? profile.avatar
      : "";

  const isProfileOwnerSlug =
    sessionVendor?.username &&
    profile?.username &&
    slugify(sessionVendor.username) === slugify(profile.username);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (_) {
      await supabase.auth.signOut().catch(() => {});
    }
    if (typeof window !== "undefined") {
      // Clear any cached Supabase tokens
      Object.keys(localStorage).forEach((k) => {
        if (k.toLowerCase().includes("supabase")) localStorage.removeItem(k);
      });
      // Hard reload to ensure UI reflects the cleared session
      window.location.href = "/homepage";
    } else {
      router.replace("/homepage");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/products/${deleteTargetId}`, { method: "DELETE" });
      setOwnedProducts((prev) => prev.filter((p) => p.id !== deleteTargetId));
    } catch (e) {
      // ignore
    } finally {
      setDeleteTargetId(null);
      setDeleteModalOpen(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!profile || !feedbackRating) return;
    setFeedbackModalOpen(false);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_user_id: profile.userId,
          vendor_username: profile.username,
          rating: feedbackRating,
          message: feedbackComment,
        }),
      });
      await fetch("/api/ratings/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_user_id: profile.userId,
          vendor_username: profile.username,
          rating: feedbackRating,
        }),
      });
      setFeedbackList((prev) => [
        ...prev,
        {
          rating: feedbackRating,
          comment: feedbackComment,
          sellerId: profile.userId,
          sellerName: profile.shopName,
          createdAt: new Date().toISOString(),
        },
      ]);
      setFeedbackRating(null);
      setFeedbackComment("");
      setToast("Thanks for your feedback!");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      // ignore
    }
  };

  const loadingNow = profilesLoading || productsLoading || feedbackLoading || loading;
  const errorNow = error || profilesError?.message || productsError?.message || feedbackError?.message;

  if (loadingNow) {
    return <ProfileSkeleton />;
  }

  if (errorNow || !profile) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontSize: "1.25rem",
          fontWeight: 700,
        }}
      >
        {errorNow || "Profile does not exist"}
      </div>
    );
  }

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <section className="profile-header">
            <div className="profile-banner">
              {bannerSrc ? (
                <img
                  src={bannerSrc}
                  className="profile-banner-image"
                  alt={profile.shopName || profile.username}
                />
              ) : null}
            </div>

            <div className="profile-info-row">
              <div className="profile-avatar-wrapper profile-avatar-left">
                <img
                  src={avatarSrc}
                  className="profile-avatar"
                  alt="Shop owner"
                  id="profileAvatar"
                />
              </div>

              <div className="profile-info-text">
                <div className="profile-shop-header-row">
                  <h1 className="profile-shop-name" id="profileShopName">
                    {profile.shopName || profile.username}
                  </h1>
                  {isOwner && (
                    <button
                      type="button"
                      className="profile-shop-edit-btn"
                      id="profileEditProfileBtn"
                      aria-label="Edit profile details"
                      onClick={() => router.push("/edit-profile")}
                    >
                      <img
                        src={theme === "clothing" ? "/icons/edit.png" : "/icons/edit-orange.png"}
                        alt="Edit profile"
                        className="profile-shop-edit-icon"
                      />
                    </button>
                  )}
                </div>
                <p className="profile-name" id="profileOwnerName">
                  @{profile.username}
                  {profile.ownerName ? <><br />{profile.ownerName}</> : null}
                </p>
                <p className="profile-location" id="profileLocation">
                  <img src="/icons/location.png" alt="" className="profile-location-icon" />
                  <span>{profile.location || "Based locally"}</span>
                </p>
                <div className="profile-contact" id="profileContact">
                  {whatsappHref ? (
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <img src="/icons/whatsapp.png" alt="WhatsApp" className="contact-icon" />
                      <span>{profile.whatsapp}</span>
                    </a>
                  ) : null}
                  {instagramHref ? (
                    <a href={instagramHref} target="_blank" rel="noreferrer">
                      <img src="/icons/instagram.png" alt="Instagram" className="contact-icon" />
                      <span>@{instagramHandle}</span>
                    </a>
                  ) : null}
                  {!whatsappHref && !instagramHref ? <span>No contact links yet.</span> : null}
                </div>
              </div>
            </div>
          </section>

          <div className="profile-tabs">
            <button
              className={`profile-tab ${tab === "products" ? "is-active" : ""}`}
              onClick={() => setTab("products")}
            >
              Products
            </button>
            <button
              className={`profile-tab ${tab === "about" ? "is-active" : ""}`}
              onClick={() => setTab("about")}
            >
              About &amp; Reviews
            </button>
          </div>

          {tab === "products" && (
            <section className="profile-tab-panel is-active" id="tab-products">
              <div className="product-grid" id="profileProductsGrid">
                {isOwner && (
                  <AddProductCard
                    theme={theme}
                    onClick={() => router.push("/add-product")}
                  />
                )}

                {ownedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    theme={theme}
                    isOwner={isOwner}
                    showVendor={false}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("activeProductId", p.id);
                      }
                      router.push(`/product/${p.id}`);
                    }}
                    onEdit={() => router.push(`/edit-product/${p.id}`)}
                    onDelete={() => {
                      setDeleteTargetId(p.id);
                      setDeleteModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {tab === "about" && (
            <section className="profile-tab-panel is-active" id="tab-about">
              <div className="profile-about">
                <h2>About this shop</h2>
                <p id="profileAboutText">{profile.aboutDescription || profile.tagline || "No description yet."}</p>
              </div>

              <div className="profile-feedback" id="profileFeedbackSection">
                <h2>Feedback &amp; Ratings</h2>
                <p className="profile-feedback-empty" id="profileFeedbackEmpty">
                  {typeof avgRating.value === "number"
                    ? (
                      <span>
                        <span className="rating-star">&#9733;</span> {avgRating.value.toFixed(1)} ({avgRating.count} rating{avgRating.count === 1 ? "" : "s"})
                      </span>
                    )
                    : "No feedback yet."}
                </p>
                <FeedbackList feedback={feedbackList} />
                {!isOwner && (
                <button
                  type="button"
                  className="btn-primary"
                  id="profileFeedbackBtn"
                  onClick={() => setFeedbackModalOpen(true)}
                >
                  Leave feedback
                </button>
              )}
            </div>
          </section>
        )}

          <div className="profile-logout-wrapper">
            {isOwner && sessionUserId && (
              <button
                type="button"
                id="profileLogoutBtn"
                className="profile-logout-btn"
                onClick={() => setLogoutModalOpen(true)}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>

      <RatingModal
        open={feedbackModalOpen}
        title="Rate this seller"
        subtitle="Share a quick rating and (optional) comment."
        selected={feedbackRating}
        onSelect={(val) => setFeedbackRating(val)}
        comment={feedbackComment}
        onCommentChange={setFeedbackComment}
        confirmLabel="Send"
        confirmDisabled={!feedbackRating}
        onCancel={() => setFeedbackModalOpen(false)}
        onConfirm={handleSendFeedback}
        usePortal={false}
      />

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
          <div className="rating-dialog">
            <h2>Delete product?</h2>
            <p className="rating-dialog-sub">This will remove the product from your profile. You can't undo this.</p>
            <div className="rating-dialog-actions">
              <button type="button" className="rating-cancel" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rating-confirm"
                onClick={handleDeleteProduct}
                disabled={!deleteTargetId}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {logoutModalOpen && (
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
          <div className="rating-dialog" style={{ maxWidth: "300px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "6px" }}>Log out?</h2>
            <p className="rating-dialog-sub" style={{ marginBottom: "14px" }}>
              You'll need to sign back in to manage your shop.
            </p>
            <div
              className="rating-dialog-actions"
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button type="button" className="rating-cancel" onClick={() => setLogoutModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rating-confirm"
                style={{ background: "#d6453d" }}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="rating-toast is-visible">{toast}</div>}


      <nav className="bottom-nav">
        <Link href="/homepage" className="nav-item">
          <span className="nav-icon-wrapper">
            <img
              src={theme === "clothing" ? "/icons/home.png" : "/icons/home-lightbrown.png"}
              className="nav-icon"
              alt=""
            />
          </span>
          <span>Home</span>
        </Link>

        <Link href="/search" className="nav-item">
          <span className="nav-icon-wrapper">
            <img
              src={theme === "clothing" ? "/icons/search.png" : "/icons/search-lightbrown.png"}
              className="nav-icon"
              alt=""
            />
          </span>
          <span>Search</span>
        </Link>

        <Link
          href={
            sessionVendor?.username
              ? `/profile/${sessionVendor.username}`
              : "/login"
          }
          className={`nav-item${isProfileOwnerSlug ? " active" : ""}`}
          id="bottomNavProfileLink"
        >
          <span className="nav-icon-wrapper">
            <img
              src={theme === "clothing" ? "/icons/profile.png" : "/icons/profile-lightbrown.png"}
              className="nav-icon"
              alt=""
            />
          </span>
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}









