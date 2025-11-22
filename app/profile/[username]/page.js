"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

export default function ProfilePage({ params }) {
  const username = params?.username;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!username) return;

    const vendorName = username
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    localStorage.setItem("activeVendorName", vendorName);

    const run = () => {
      if (typeof window === "undefined") return;
      window.applySavedBodyTheme?.();
      window.updateNavIconsByTheme?.();
      window.initProfileTabs?.();
      window.initProfilePage?.();
      window.initProfileNavGuard?.();
      window.initProductCardBackgrounds?.();
      setReady(true);
    };

    // Run once now and once after a short delay to ensure DOM is ready
    run();
    const timer = setTimeout(run, 120);
    return () => clearTimeout(timer);
  }, [username]);

  if (!ready) {
    return <div style={{ minHeight: "100vh", background: "#fff" }} />;
  }

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <section className="profile-header">
            <div className="profile-banner">
              <img src="" className="profile-banner-image" alt="" id="profileBanner" />
            </div>

            <div className="profile-info-row">
              <div className="profile-avatar-wrapper profile-avatar-left">
                <img src="" className="profile-avatar" alt="Shop owner" id="profileAvatar" />
              </div>

              <div className="profile-info-text">
                <div className="profile-shop-header-row">
                  <h1 className="profile-shop-name" id="profileShopName">
                    Shop Name
                  </h1>
                  <button
                    type="button"
                    className="profile-shop-edit-btn"
                    id="profileEditProfileBtn"
                    aria-label="Edit profile details"
                  >
                    <img
                      src="/icons/edit.png"
                      alt="Edit profile"
                      className="profile-shop-edit-icon"
                      data-blue="/icons/edit.png"
                      data-brown="/icons/edit-orange.png"
                    />
                  </button>
                </div>
                <p className="profile-name" id="profileOwnerName">
                  @username
                </p>
                <p className="profile-location" id="profileLocation">
                  Location
                </p>
                <p className="profile-contact" id="profileContact">
                  Contact
                </p>
              </div>
            </div>
          </section>

          <div className="profile-tabs">
            <button className="profile-tab is-active" data-tab="products">
              Products
            </button>
            <button className="profile-tab" data-tab="about">
              About &amp; Reviews
            </button>
          </div>

          <section className="profile-tab-panel is-active" id="tab-products">
            <div className="product-grid" id="profileProductsGrid"></div>
          </section>

          <section className="profile-tab-panel" id="tab-about">
            <div className="profile-about">
              <h2>About this shop</h2>
              <p id="profileAboutText"></p>
            </div>

            <div className="profile-feedback" id="profileFeedbackSection">
              <h2>Feedback &amp; Ratings</h2>
              <p className="profile-feedback-empty" id="profileFeedbackEmpty">
                No feedback yet.
              </p>
              <ul className="profile-feedback-list" id="profileFeedbackList"></ul>
              <button type="button" className="btn-primary" id="profileFeedbackBtn">
                Leave seller feedback
              </button>
            </div>
          </section>
          <div className="profile-logout-wrapper">
            <button type="button" id="profileLogoutBtn" className="profile-logout-btn">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="feedback-overlay" id="logoutOverlay" aria-hidden="true">
        <div className="feedback-backdrop"></div>

        <div
          className="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logoutTitle"
          style={{ maxWidth: "360px" }}
        >
          <button className="feedback-close" id="logoutCloseBtn" aria-label="Close logout dialog"></button>

          <h2 id="logoutTitle" className="feedback-title" style={{ textAlign: "center" }}>
            Log out?
          </h2>
          <p className="feedback-subtitle" style={{ textAlign: "center" }}>
            Are you sure you want to log out of Vendors Market?
          </p>

          <div className="logout-actions">
            <button type="button" className="btn-secondary" id="logoutCancelBtn">
              Cancel
            </button>
            <button type="button" className="btn-primary logout-confirm-btn" id="logoutConfirmBtn">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="feedback-overlay" id="deleteProductOverlay" aria-hidden="true">
        <div className="feedback-backdrop"></div>

        <div
          className="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteProductTitle"
        >
          <button className="feedback-close" id="deleteProductCloseBtn" aria-label="Close delete dialog"></button>

          <h2 id="deleteProductTitle" className="feedback-title" style={{ textAlign: "center" }}>
            Delete product?
          </h2>
          <p className="feedback-subtitle" style={{ textAlign: "center" }}>
            This will remove the product from your profile. You can’t undo this action.
          </p>

          <div className="logout-actions">
            <button type="button" className="btn-secondary" id="deleteProductCancelBtn">
              Cancel
            </button>
            <button type="button" className="btn-primary logout-confirm-btn" id="deleteProductConfirmBtn">
              Delete
            </button>
          </div>
        </div>
      </div>

      <nav className="bottom-nav">
        <Link href="/homepage" className="nav-item">
          <span className="nav-icon-wrapper">
            <img
              src="/icons/home.png"
              className="nav-icon"
              data-blue="/icons/home.png"
              data-brown="/icons/home-lightbrown.png"
              alt=""
            />
          </span>
          <span>Home</span>
        </Link>

        <Link href="/search" className="nav-item">
          <span className="nav-icon-wrapper">
            <img
              src="/icons/search.png"
              className="nav-icon"
              data-blue="/icons/search.png"
              data-brown="/icons/search-lightbrown.png"
              alt=""
            />
          </span>
          <span>Search</span>
        </Link>

        <Link href={`/profile/${username}`} className="nav-item" id="bottomNavProfileLink">
          <span className="nav-icon-wrapper">
            <img
              src="/icons/profile.png"
              className="nav-icon"
              data-blue="/icons/profile.png"
              data-brown="/icons/profile-lightbrown.png"
              alt=""
            />
          </span>
          <span>Profile</span>
        </Link>
      </nav>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
