"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { RatingModal } from "../../components/RatingModal";
import { useThemeIcons } from "../../../lib/useThemeIcons";

function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const all = await res.json();
        if (active) setProducts(all || []);
        const found = id ? all.find((p) => p.id === id) : null;
        const chosen = found || all[0] || null;
        if (active) setProduct(chosen);
      } catch (e) {
        if (active) setError(e.message || "Failed to load product");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  return { product, products, loading, error };
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || null;
  const { product, products, loading, error } = useProduct(id);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(null);
  const [ratingCount, setRatingCount] = useState(null);
  const [storedRating, setStoredRating] = useState(null);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeIcons("clothing");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (product) {
      setRatingValue(product.ratingValue);
      setRatingCount(product.ratingCount);
      setActiveIndex(0);
      if (typeof document !== "undefined") {
        const titleEl = document.getElementById("productTitle");
        if (titleEl) titleEl.textContent = product.name || "Product";
      }
    }
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    return product.image ? [product.image] : [];
  }, [product]);

  const handleTouchStart = (e) => {
    if (images.length <= 1) return;
    const x = e.touches?.[0]?.clientX ?? null;
    touchStartX.current = x;
    touchCurrentX.current = x;
  };

  const handleTouchMove = (e) => {
    if (images.length <= 1) return;
    touchCurrentX.current = e.touches?.[0]?.clientX ?? touchCurrentX.current;
  };

  const handleTouchEnd = () => {
    if (images.length <= 1) return;
    const start = touchStartX.current;
    const end = touchCurrentX.current;
    touchStartX.current = null;
    touchCurrentX.current = null;
    if (start === null || end === null) return;
    const delta = end - start;
    const threshold = 40;
    if (delta > threshold && activeIndex > 0) {
      setActiveIndex((idx) => Math.max(0, idx - 1));
    } else if (delta < -threshold && activeIndex < images.length - 1) {
      setActiveIndex((idx) => Math.min(images.length - 1, idx + 1));
    }
  };

  const similarProducts = useMemo(() => {
    if (!product || !Array.isArray(products)) return [];
    const targetSub =
      (product.subCategory || product.subcategory || product.sub_category || "").toString().toLowerCase();
    if (!targetSub) return [];
    return products
      .filter((p) => {
        if (!p || p.id === product.id) return false;
        const sub = (p.subCategory || p.subcategory || p.sub_category || "").toString().toLowerCase();
        return sub === targetSub;
      })
      .slice(0, 10);
  }, [product, products]);

  const handleRate = async () => {
    if (!product || !selectedRating) return;
    const ratedKey = `rated_${product.id}`;
    localStorage.setItem(ratedKey, String(selectedRating));
    try {
      const res = await fetch("/api/ratings/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, rating: selectedRating }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload && typeof payload.rating_value === "number" && typeof payload.rating_count === "number") {
        setRatingValue(payload.rating_value);
        setRatingCount(payload.rating_count);
      } else {
        // optimistic update
        const currentValue = Number(ratingValue) || 0;
        const currentCount = Number(ratingCount) || 0;
        const total = currentValue * currentCount + selectedRating;
        const newCount = currentCount + 1;
        setRatingValue(total / newCount);
        setRatingCount(newCount);
      }
    } catch (e) {
      // ignore network errors; optimistic update above
    } finally {
      setToast("Thanks for rating!");
      setTimeout(() => setToast(""), 1800);
      setRatingModalOpen(false);
      setSelectedRating(null);
    }
  };

  const handleRemoveRating = async () => {
    if (!product) return;
    const ratedKey = `rated_${product.id}`;
    localStorage.removeItem(ratedKey);
    const removeVal = Number(storedRating || selectedRating || 0);

    try {
      const res = await fetch("/api/ratings/product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, rating: removeVal }),
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload && typeof payload.rating_value === "number" && typeof payload.rating_count === "number") {
        setRatingValue(payload.rating_value);
        setRatingCount(payload.rating_count);
      } else {
        // optimistic fallback
        const currentValue = Number(ratingValue) || 0;
        const currentCount = Number(ratingCount) || 0;
        if (currentCount > 0) {
          const total = currentValue * currentCount - removeVal;
          const newCount = Math.max(0, currentCount - 1);
          setRatingCount(newCount);
          setRatingValue(newCount > 0 ? total / newCount : 0);
        }
      }
    } catch (_) {
      const currentValue = Number(ratingValue) || 0;
      const currentCount = Number(ratingCount) || 0;
      if (currentCount > 0) {
        const total = currentValue * currentCount - removeVal;
        const newCount = Math.max(0, currentCount - 1);
        setRatingCount(newCount);
        setRatingValue(newCount > 0 ? total / newCount : 0);
      }
    }

    setToast("Your rating was removed");
    setTimeout(() => setToast(""), 1800);
    setRatingModalOpen(false);
    setSelectedRating(null);
  };

  const ratedKey = product ? `rated_${product.id}` : null;
  const alreadyRated = typeof window !== "undefined" && product && ratedKey ? localStorage.getItem(ratedKey) : null;

  useEffect(() => {
    if (ratingModalOpen) {
      if (alreadyRated) {
        const val = Number(alreadyRated);
        setSelectedRating(Number.isFinite(val) ? val : null);
        setStoredRating(Number.isFinite(val) ? val : null);
      } else {
        setSelectedRating(null);
        setStoredRating(null);
      }
    }
  }, [ratingModalOpen, alreadyRated]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <div style={{ padding: "1.5rem" }}>{error || "Product not found."}</div>;
  }

  return (
    <div className="page-transition">
      <div className="page product-detail-page">
        <header className="product-detail-header">
          <button className="back-button" onClick={() => router.back()} aria-label="Back">
            <img
              src={theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png"}
              alt="Back"
              className="back-icon"
            />
          </button>
        </header>

        <section className="product-detail-main">
          <div className="product-detail-hero">
            <div className="product-detail-hero-inner">
              {images.length > 1 && (
                <>
                  <button
                    className="product-detail-nav prev"
                    aria-label="Previous image"
                    onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  >
                    <img src="/icons/left.png" alt="Previous" />
                  </button>
                  <button
                    className="product-detail-nav next"
                    aria-label="Next image"
                    onClick={() => setActiveIndex(Math.min(images.length - 1, activeIndex + 1))}
                  >
                    <img src="/icons/right.png" alt="Next" />
                  </button>
                </>
              )}
              <div
                className="product-detail-slider"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {images.map((src, idx) => (
                  <div className="product-detail-slide" key={`${src}-${idx}`}>
                    <img src={src} alt={product.name} className="product-image" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {images.length > 1 && (
            <div className="product-detail-dots product-detail-dots-below">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`product-detail-dot${idx === activeIndex ? " is-active" : ""}`}
                  data-index={idx}
                  onClick={() => setActiveIndex(idx)}
                ></span>
              ))}
            </div>
          )}

          <h1 id="productTitle" className="product-detail-title" style={{ margin: "12px 0 8px" }}>
            {product.name}
          </h1>

          <div className="product-detail-meta">
            <p className="price">&#8358;{Number(product.price || 0).toLocaleString()}</p>
          </div>

          {typeof ratingValue === "number" && typeof ratingCount === "number" ? (
            <p className="rating product-detail-rating" style={{ marginTop: "4px" }}>
              &#9733; <span id="productRatingValue">{ratingValue.toFixed(1)}</span> (
              <span id="productRatingCount">{ratingCount}</span>){" "}
              <button
                id="rateProductBtn"
                className="rate-link"
                type="button"
                onClick={() => setRatingModalOpen(true)}
              >
                {alreadyRated ? "Remove My Rating" : "Rate"}
              </button>
            </p>
          ) : null}

          <div className="product-detail-seller">
            <div className="product-detail-seller-avatar">
              <img src={product.sellerAvatar || "/images/default-pfp.jpg"} alt={product.vendor} />
            </div>
            <div
              className="product-detail-seller-text"
              id="productSellerLink"
              style={{ cursor: "pointer" }}
              onClick={() => {
                const slug = product.vendorUsername;
                router.push(slug ? `/profile/${slug}` : "/login");
              }}
            >
              <span className="product-detail-seller-name">
                {product.vendorShopName || product.vendor}
              </span>
              <span className="product-detail-seller-extra">
                <img src="/icons/location.png" alt="" className="product-detail-location-icon" />
                {product.vendorLocation || "Trusted local vendor"}
                {typeof product.vendorRatingValue === "number" && typeof product.vendorRatingCount === "number" ? (
                  <>
                    <span className="dot-separator"> &middot; </span>
                    <span className="product-detail-seller-rating-inline">
                      &#9733; {product.vendorRatingValue.toFixed(1)} ({product.vendorRatingCount})
                    </span>
                  </>
                ) : null}
              </span>
            </div>
          </div>

          {(product.whatsapp || product.instagram) && (
            <div className="product-contact-actions">
              {product.whatsapp ? (
                <a
                  className="contact-btn"
                  href={product.whatsapp.startsWith("http") ? product.whatsapp : `https://wa.me/${product.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/whatsapp.png" alt="" className="contact-icon" />
                  Contact
                </a>
              ) : null}
              {product.instagram ? (
                <a
                  className="contact-btn"
                  href={
                    product.instagram.startsWith("http")
                      ? product.instagram
                      : `https://instagram.com/${product.instagram.replace(/^@+/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/instagram.png" alt="" className="contact-icon" />
                  Contact
                </a>
              ) : null}
            </div>
          )}

          {product.description ? (
            <div className="product-about" style={{ marginTop: 14 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem" }}>About this product</h3>
              <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.5 }}>
                {product.description}
              </p>
            </div>
          ) : null}
        </section>

        {similarProducts.length ? (
          <section className="product-similar-section" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: "1.1rem" }}>Similar products</h2>
            <div className="landing-slider subcategory-row-scroll">
              {similarProducts.map((p) => {
                const cover =
                  p.image ||
                  p.coverImage ||
                  p.cover_image ||
                  (Array.isArray(p.images) && p.images.length ? p.images[0] : "/images/default-product.jpg");
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
                      <p className="price">&#8358;{Number(p.price || 0).toLocaleString()}</p>
                      <p className="details-vendor">{vendorName}</p>
                      <p className="details">
                        <span className="rating-star">&#9733;</span>{" "}
                        {ratingVal > 0 ? ratingVal.toFixed(1) : "0.0"} ({ratingCnt})
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <RatingModal
        open={mounted && ratingModalOpen}
        title="Rate this product"
        subtitle="How would you rate it out of 5?"
        selected={selectedRating}
        onSelect={(val) => setSelectedRating(val)}
        confirmLabel="Confirm"
        confirmDisabled={!selectedRating}
        onCancel={() => setRatingModalOpen(false)}
        onConfirm={alreadyRated ? undefined : handleRate}
        onRemove={alreadyRated ? handleRemoveRating : undefined}
        removeLabel="Remove"
      />
      {toast && <div className="rating-toast is-visible">{toast}</div>}
    </div>
  );
}

function ProductSkeleton() {
  const sliderCards = Array.from({ length: 4 });

  return (
    <div className="product-detail-page product-skeleton-container">
      <div className="product-detail-main">
        <div className="skeleton product-skeleton-back product-skeleton-back-floating" />
        <div className="skeleton product-skeleton-hero" />

        <div className="product-skeleton-body">
          <div className="skeleton skeleton-line" style={{ width: "68%", height: 18 }} />
          <div className="skeleton skeleton-line" style={{ width: "42%", height: 16 }} />
          <div className="skeleton skeleton-line" style={{ width: "55%", height: 12 }} />

          <div className="product-skeleton-seller">
            <div className="skeleton product-skeleton-avatar" />
            <div className="product-skeleton-seller-lines">
              <div className="skeleton skeleton-line" style={{ width: "60%", height: 12 }} />
              <div className="skeleton skeleton-line" style={{ width: "72%", height: 12 }} />
            </div>
          </div>

          <div className="product-skeleton-contacts">
            <div className="skeleton skeleton-contact-pill" />
            <div className="skeleton skeleton-contact-pill" />
          </div>

          <div className="product-skeleton-about">
            <div className="skeleton skeleton-line" style={{ width: "36%", height: 14 }} />
            <div className="skeleton skeleton-line" style={{ width: "95%", height: 12 }} />
            <div className="skeleton skeleton-line" style={{ width: "92%", height: 12 }} />
            <div className="skeleton skeleton-line" style={{ width: "80%", height: 12 }} />
          </div>

          <div className="product-skeleton-similar">
            <div className="skeleton skeleton-line" style={{ width: "46%", height: 14 }} />
            <div className="product-skeleton-slider">
              {sliderCards.map((_, idx) => (
                <div key={idx} className="skeleton-card-wrapper skeleton-slider-card">
                  <div className="skeleton skeleton-card-small" />
                  <div className="skeleton skeleton-line" style={{ width: "82%", height: 12 }} />
                  <div className="skeleton skeleton-line" style={{ width: "70%", height: 12 }} />
                  <div className="skeleton skeleton-line" style={{ width: "58%", height: 12 }} />
                  <div className="skeleton skeleton-line" style={{ width: "64%", height: 12 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
