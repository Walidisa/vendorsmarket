"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RatingModal } from "../../components/RatingModal";
import { useThemeIcons } from "../../../lib/useThemeIcons";

function useProduct(id) {
  const [product, setProduct] = useState(null);
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

  return { product, loading, error };
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || null;
  const { product, loading, error } = useProduct(id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(null);
  const [ratingCount, setRatingCount] = useState(null);
  const [storedRating, setStoredRating] = useState(null);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeIcons("food");

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
    // Optimistically adjust counts
    const currentValue = Number(ratingValue) || 0;
    const currentCount = Number(ratingCount) || 0;
    const removeVal = Number(storedRating || selectedRating || 0);
    if (currentCount > 1) {
      const total = currentValue * currentCount - removeVal;
      const newCount = currentCount - 1;
      setRatingValue(total / newCount);
      setRatingCount(newCount);
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
    return <div style={{ padding: "1.5rem" }}>Loading product…</div>;
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
          <h1 id="productTitle">{product.name}</h1>
        </header>

        <section className="product-detail-main">
          <div className="product-detail-hero">
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
            <div className="product-detail-slider" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {images.map((src, idx) => (
                <div className="product-detail-slide" key={`${src}-${idx}`}>
                  <img src={src} alt={product.name} className="product-image" />
                </div>
              ))}
            </div>
            <div className="product-detail-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`product-detail-dot${idx === activeIndex ? " is-active" : ""}`}
                  data-index={idx}
                  onClick={() => setActiveIndex(idx)}
                ></span>
              ))}
            </div>
          </div>

          <div className="product-detail-meta">
            <p className="price">&#8358;{Number(product.price || 0).toLocaleString()}</p>
          </div>

          {typeof ratingValue === "number" && typeof ratingCount === "number" ? (
            <p className="rating" style={{ marginTop: "4px" }}>
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

          {product.description ? <p className="product-detail-description">{product.description}</p> : null}

          {product.vendorMotto || product.sellerDetails ? (
            <p className="product-detail-motto">{product.vendorMotto || product.sellerDetails}</p>
          ) : null}

          <div className="product-detail-seller">
            <div className="product-detail-seller-avatar">
              <img src={product.sellerAvatar || "/images/default-seller.jpg"} alt={product.vendor} />
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
                {typeof product.vendorRatingValue === "number" && typeof product.vendorRatingCount === "number" ? (
                  <span className="product-detail-seller-rating">
                    &#9733; {product.vendorRatingValue.toFixed(1)} ({product.vendorRatingCount})
                  </span>
                ) : null}
              </span>
              <span className="product-detail-seller-extra">
                {product.vendorLocation || "Trusted local vendor"}
              </span>
            </div>
          </div>
        </section>
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
