"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  const slides = [
    "Expand your business beyond your Whatsapp contacts",
    "All your local vendors in one place",
    "Affordable and easily accessible products",
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroTheme, setHeroTheme] = useState("food");
  const [landingProducts, setLandingProducts] = useState([]);
  const [landingCategory, setLandingCategory] = useState("food");
  const [featuredVendors, setFeaturedVendors] = useState([]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("activeTheme") : null;
    if (saved === "clothing" || saved === "food") {
      setHeroTheme(saved);
      setLandingCategory(saved);
    }
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3200);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setLandingProducts(data || []);
      } catch (e) {
        // ignore
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadVendors() {
      try {
        const res = await fetch("/api/profiles", { cache: "no-store" });
        if (!res.ok) return;
        const profiles = (await res.json()) || [];
        const sorted = [...profiles].sort((a, b) => {
          const ra = Number(a.rating_value || 0);
          const rb = Number(b.rating_value || 0);
          const ca = Number(a.rating_count || 0);
          const cb = Number(b.rating_count || 0);
          if (rb !== ra) return rb - ra;
          return cb - ca;
        });
        setFeaturedVendors(sorted.slice(0, 4));
      } catch (e) {
        // ignore
      }
    }
    loadVendors();
  }, []);

  return (
    <>
      <div className="page">
        <div className={`hero-shell theme-${heroTheme}`}>
          <header className="site-header">
            <div className="site-logo">vendorsmarket.ng</div>
          </header>

          <header className="page-hero">
            <h1>
              <strong>{slides[slideIndex]}</strong>
            </h1>
            <div className="hero-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Slide ${idx + 1}`}
                  className={`hero-dot${idx === slideIndex ? " active" : ""}`}
                  onClick={() => setSlideIndex(idx)}
                />
              ))}
            </div>

            <div className="hero-actions">
              <Link href="/homepage">
                <button className="btn-primary">Browse shops</button>
              </Link>
              <Link href="/signup">
                <button className="btn-secondary">Become a seller</button>
              </Link>
            </div>
          </header>
        </div>

        <section className={`landing-categories theme-${heroTheme}`}>
          <div className={`pill-toggle ${landingCategory}`}>
            <div className="pill-highlight" />
            <button
              className={`pill ${landingCategory === "food" ? "active" : ""}`}
              onClick={() => {
                setLandingCategory("food");
                setHeroTheme("food");
                if (typeof window !== "undefined") {
                  localStorage.setItem("activeTheme", "food");
                }
              }}
            >
              Food
            </button>
            <button
              className={`pill ${landingCategory === "clothing" ? "active" : ""}`}
              onClick={() => {
                setLandingCategory("clothing");
                setHeroTheme("clothing");
                if (typeof window !== "undefined") {
                  localStorage.setItem("activeTheme", "clothing");
                }
              }}
            >
              Clothing
            </button>
          </div>

          <div className="landing-slider subcategory-row-scroll">
            {(landingProducts || [])
              .filter((p) => (p.mainCategory || p.main_category) === landingCategory)
              .sort((a, b) => {
                const ra = Number(a.rating_value || a.ratingValue || 0);
                const rb = Number(b.rating_value || b.ratingValue || 0);
                const ca = Number(a.rating_count || a.ratingCount || 0);
                const cb = Number(b.rating_count || b.ratingCount || 0);
                // prioritize rating value, then count
                if (rb !== ra) return rb - ra;
                return cb - ca;
              })
              .slice(0, 7)
              .map((p) => {
                const cover =
                  p.coverImage ||
                  p.cover_image ||
                  (Array.isArray(p.images) && p.images.length ? p.images[0] : null) ||
                  "/images/default-product.jpg";
                const vendorName =
                  p.vendorShopName ||
                  p.shop_name ||
                  p.shopName ||
                  p.vendorName ||
                  p.vendor_username ||
                  p.vendorUsername ||
                  "";
                const ratingVal = Number(p.rating_value || p.ratingValue || 0);
                const ratingCnt = Number(p.rating_count || p.ratingCount || 0);
                return (
                  <div key={p.id} className="product-card">
                    <div className="product-image-wrapper">
                      <div className="product-image-box">
                        <img src={cover} alt={p.name} className="product-image" />
                      </div>
                    </div>
                    <div className="product-info">
                      <h3>{p.name}</h3>
                      <p className="price">₦{Number(p.price || 0).toLocaleString()}</p>
                      <p className="details-vendor">{vendorName}</p>
                      <p className="details">
                        <span className="rating-star">★</span>{" "}
                        {ratingVal > 0 ? ratingVal.toFixed(1) : "0.0"} ({ratingCnt})
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {featuredVendors.length > 0 && (
          <section className="landing-featured">
            <h2>Featured vendors</h2>
            <div className="vendor-slider">
              {featuredVendors.map((v) => (
                <Link key={v.username} href={`/profile/${v.username}`} className="vendor-card">
                  <div className="vendor-avatar-wrapper">
                    <img
                      src={v.avatar || "/images/default-seller.jpg"}
                      alt={v.shopName || v.username}
                      className="vendor-avatar"
                    />
                  </div>
                  <div className="vendor-info">
                    <h3 className="vendor-name">{v.shopName || v.username}</h3>
                    <p className="vendor-username">@{v.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="card-grid">
          <article className={`card theme-${heroTheme}`}>
            <h2>One home for your favourite vendors</h2>
            <p>
              Discover food, fashion and everyday essentials from trusted local sellers, all in one simple
              mobile marketplace.
            </p>
          </article>

          <article className={`card theme-${heroTheme}`}>
            <h2>Built for small businesses</h2>
            <p>
              Vendors Market makes it easier for small shops to show their products, share links and
              connect with more customers.
            </p>
          </article>

          <article className={`card theme-${heroTheme}`}>
            <h2>Support the people behind the shops</h2>
            <p>Your purchases go directly to real vendors and help local communities grow.</p>
          </article>
        </section>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
