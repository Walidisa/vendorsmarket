"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  applyThemeAndBroadcast,
  applyThemeClasses,
  getInitialPreferences,
  getStoredDarkMode,
  persistTheme
} from "../lib/themeUtils";
import { SeoJsonLd } from "./components/SeoJsonLd";

export default function HomeClient() {
  const slides = [
    "Expand your business beyond your Whatsapp contacts",
    "All your local vendors in one place",
    "Affordable and easily accessible products",
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroTheme, setHeroTheme] = useState("clothing");
  const [landingProducts, setLandingProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [landingCategory, setLandingCategory] = useState("clothing");
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [heroVisible, setHeroVisible] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vendorsmarket.com.ng";
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vendors Market",
    url: siteUrl,
    logo: `${siteUrl}/icons/app-icon.png`,
    sameAs: []
  };
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vendors Market",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={query}`,
      "query-input": "required name=query"
    }
  };

  const applyTheme = (theme) => {
    setLandingCategory(theme);
    setHeroTheme(theme);
    if (typeof window === "undefined") return;
    const isDark = getStoredDarkMode();
    persistTheme(theme);
    applyThemeAndBroadcast(theme, isDark);
  };

  const heroRef = useRef(null);
  const cardsRef = useRef(null);

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
    const { theme, isDark } = getInitialPreferences("clothing");
    setHeroTheme(theme);
    setLandingCategory(theme);
    applyThemeClasses(theme, isDark);
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3200);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setLandingProducts(data || []);
      } catch (e) {
        // ignore
      } finally {
        setProductsLoading(false);
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
        setVendors(profiles);
      } catch (e) {
        // ignore
      } finally {
        setVendorsLoading(false);
      }
    }
    loadVendors();
  }, []);

  useEffect(() => {
    if (!vendors.length) return;

    const productCounts = new Map();
    (landingProducts || []).forEach((p) => {
      const key =
        p.vendorUsername ||
        p.vendor_username ||
        p.vendor ||
        p.vendorShopName ||
        p.shopName ||
        p.vendorName ||
        "";
      if (!key) return;
      productCounts.set(key, (productCounts.get(key) || 0) + 1);
    });

    const sorted = [...vendors].sort((a, b) => {
      const ca = productCounts.get(a.username) || 0;
      const cb = productCounts.get(b.username) || 0;
      if (cb !== ca) return cb - ca;

      const ra = Number(a.rating_value || 0);
      const rb = Number(b.rating_value || 0);
      if (rb !== ra) return rb - ra;

      const rca = Number(a.rating_count || 0);
      const rcb = Number(b.rating_count || 0);
      return rcb - rca;
    });

    setFeaturedVendors(sorted.slice(0, 6));
  }, [vendors, landingProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === heroRef.current) {
            setHeroVisible(entry.isIntersecting);
          }
          if (entry.target === cardsRef.current) {
            setCardsVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (cardsRef.current) observer.observe(cardsRef.current);

    return () => observer.disconnect();
  }, []);

  if (productsLoading || vendorsLoading) {
    return (
      <>
        <SeoJsonLd data={orgLd} />
        <SeoJsonLd data={siteLd} />
        <HomeSkeleton />
        <Script src="/scripts/main.js" strategy="afterInteractive" />
      </>
    );
  }

  return (
    <>
      <SeoJsonLd data={orgLd} />
      <SeoJsonLd data={siteLd} />
      <div className="page">
        <div ref={heroRef} className={`hero-shell theme-${heroTheme} fade-section${heroVisible ? " visible" : ""}`}>
          <header className="site-header">
            <div className="site-logo">vendorsmarket.com.ng</div>
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
                <button className="btn-primary">Explore all products</button>
              </Link>
              <Link href="/signup">
                <button className="btn-primary">Become a vendor</button>
              </Link>
            </div>
          </header>
        </div>

        <section className={`landing-categories theme-${heroTheme}`}>
          <div className={`pill-toggle ${landingCategory}`}>
            <div className="pill-highlight" />
            <button
              className={`pill ${landingCategory === "food" ? "active" : ""}`}
              onClick={() => applyTheme("food")}
            >
              Food
            </button>
            <button
              className={`pill ${landingCategory === "clothing" ? "active" : ""}`}
              onClick={() => applyTheme("clothing")}
            >
              Clothing
            </button>
          </div>

          <h2>Most rated products</h2>

          {/* Group products by subcategory and show a 'See all' button for each */}
          {(() => {
            const grouped = {};
            (landingProducts || [])
              .filter((p) => (p.mainCategory || p.main_category) === landingCategory)
              .forEach((p) => {
                const sub = p.subcategory || p.sub_category || "other";
                if (!grouped[sub]) grouped[sub] = [];
                grouped[sub].push(p);
              });
            return Object.entries(grouped).map(([sub, products]) => (
              <div key={sub} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                </div>
                <div className="landing-slider most-rated-slider">
                  {products
                    .sort((a, b) => {
                      const ra = Number(a.rating_value || a.ratingValue || 0);
                      const rb = Number(b.rating_value || b.ratingValue || 0);
                      const ca = Number(a.rating_count || a.ratingCount || 0);
                      const cb = Number(b.rating_count || b.ratingCount || 0);
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
                        <Link
                          key={p.id}
                          href={`/product/${p.id}`}
                          className="product-card"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("activeProductId", p.id);
                            }
                          }}
                        >
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
                        </Link>
                      );
                    })}
                </div>
              </div>
            ));
          })()}
        </section>

        {featuredVendors.length > 0 && (
          <section className="landing-featured">
            <h2>Featured vendors</h2>
            <div className="vendor-slider">
              {featuredVendors.map((v) => (
                <Link key={v.username} href={`/profile/${v.username}`} className="vendor-card">
                  <div className="vendor-avatar-wrapper">
                    <img
                      src={v.avatar || "/images/default-pfp.jpg"}
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

        <section ref={cardsRef} className={`card-grid fade-section${cardsVisible ? " visible" : ""}`}>
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

function HomeSkeleton() {
  return (
    <div className="page">
      <div className="skeleton-hero-shell" style={{ marginBottom: 16 }}>
        <div className="skeleton skeleton-line" style={{ width: "70%", height: 22, marginTop: 32 }}></div>
        <div className="skeleton-dots">
          {Array.from({ length: 3 }).map((_, idx) => (
            <span key={idx} className="skeleton skeleton-dot"></span>
          ))}
        </div>
        <div className="skeleton-hero-actions">
          <div className="skeleton skeleton-pill skeleton-pill-wide"></div>
          <div className="skeleton skeleton-pill skeleton-pill-wide"></div>
        </div>
      </div>

      <section className="landing-categories" style={{ marginTop: 8 }}>
        <div className="skeleton-pill-toggle">
          <div className="skeleton skeleton-pill"></div>
          <div className="skeleton skeleton-pill"></div>
        </div>

        <div className="skeleton-section-header">
          <div className="skeleton skeleton-line" style={{ width: "40%", height: 16 }}></div>
        </div>

        <div className="landing-slider subcategory-row-scroll">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton-card-wrapper skeleton-slider-card">
              <div className="skeleton skeleton-card skeleton-card-small"></div>
              <div className="skeleton skeleton-line skeleton-line-small"></div>
              <div className="skeleton skeleton-line skeleton-line-smaller"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-featured">
        <div className="skeleton-section-header">
          <div className="skeleton skeleton-line" style={{ width: "50%", height: 16 }}></div>
        </div>
        <div className="vendor-slider">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="vendor-card skeleton skeleton-card skeleton-card-small"></div>
          ))}
        </div>
      </section>
    </div>
  );
}
