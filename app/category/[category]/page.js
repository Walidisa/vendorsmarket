"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Script from "next/script";
import { ProductCard } from "../../components/ProductCard";
import { useThemeIcons } from "../../../lib/useThemeIcons";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const subcategory = params?.category || "";
  const { theme } = useThemeIcons("food");

  const normalize = (val) => (val ? String(val).toLowerCase() : "");
  const activeSub = normalize(subcategory);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const all = await res.json();
        const filteredRaw = activeSub
          ? all.filter((p) => normalize(p.subcategory || p.sub_category || p.subCategory) === activeSub)
          : all;
        const normalizedProducts = (filteredRaw || []).map((p) => {
          const image =
            p.image ||
            p.coverImage ||
            p.cover_image ||
            (Array.isArray(p.images) && p.images.length ? p.images[0] : "/images/default-product.jpg");
          return {
            ...p,
            image,
            mainCategory: p.mainCategory || p.main_category || "",
            subCategory: p.subCategory || p.subcategory || p.sub_category || "",
            ratingValue:
              typeof p.ratingValue === "number" ? p.ratingValue : Number(p.rating_value || 0),
            ratingCount:
              typeof p.ratingCount === "number" ? p.ratingCount : Number(p.rating_count || 0),
            vendorShopName:
              p.vendorShopName ||
              p.shop_name ||
              p.shopName ||
              p.vendorName ||
              p.vendor_username ||
              p.vendorUsername ||
              "",
          };
        });
        setProducts(normalizedProducts);
      } catch (e) {
        setError(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeSub]);

  const handleProductClick = (id) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeProductId", id);
    }
    router.push(`/product?id=${id}`);
  };

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <header className="subcategory-page-header">
            <button
              className="back-button"
              id="subcategoryBackBtn"
              aria-label="Back to home"
              onClick={() => router.back()}
            >
              <img
                src={theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png"}
                alt="Back"
                className="back-icon"
                data-blue="/icons/back.png"
                data-brown="/icons/back-orange.png"
              />
            </button>
            <h1 id="subcategoryTitle">
              {subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : "Products"}
            </h1>
          </header>

          <section className="subcategory-page-grid" id="subcategoryPageGrid">
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: "#b00" }}>{error}</div>}
            {!loading && !error && products.length === 0 && <div>No products found.</div>}
            {!loading &&
              !error &&
              products.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => handleProductClick(p.id)} />
              ))}
          </section>
        </div>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
