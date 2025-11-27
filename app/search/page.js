"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts, useProfiles } from "../../lib/useData";
import { ProductCard } from "../components/ProductCard";
import { useSessionVendor } from "../../lib/useSessionVendor";
import { useThemeIcons } from "../../lib/useThemeIcons";

export default function SearchPage() {
  const { vendor } = useSessionVendor();
  const { products = [] } = useProducts();
  const { profiles = [] } = useProfiles();
  const { theme, setTheme } = useThemeIcons("clothing");
  const [profileHref, setProfileHref] = useState("/login");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const vendors = useMemo(() => {
    const map = new Map();
    profiles.forEach((prof) => {
      const key = prof.username || "";
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          username: prof.username,
          shopName: prof.shopName || prof.username,
          fullName: prof.ownerName || "",
          avatar: prof.avatar || "/images/default-seller.jpg",
        });
      }
    });
    products.forEach((p) => {
      const key = p.vendorUsername || p.vendor || "";
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          username: p.vendorUsername || "",
          shopName: p.vendorShopName || p.vendor || "",
          fullName: p.vendorFullName || "",
          avatar: p.sellerAvatar || "/images/default-seller.jpg",
        });
      }
    });
    return Array.from(map.values());
  }, [products, profiles]);

  useEffect(() => {
    if (vendor?.username) {
      setProfileHref(`/profile/${vendor.username}`);
    } else {
      setProfileHref("/login");
    }
  }, [vendor]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.vendorShopName,
        p.vendorUsername,
        p.vendorFullName,
        p.vendorLocation,
        p.mainCategory,
        p.subCategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [products, query]);

  const filteredVendors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return vendors.filter((v) => {
      const haystack = [v.shopName, v.username, v.fullName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [vendors, query]);

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
          <div className="search-hero">
            <h1>Search Products</h1>
            <p>Find items across all vendors.</p>
          </div>

          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="text"
              className="search-input"
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          {filteredVendors.length > 0 && (
            <section className="vendor-grid">
              {filteredVendors.map((v) => (
                <div
                  key={v.username}
                  className="product-card vendor-card"
                  onClick={() => router.push(v.username ? `/profile/${v.username}` : "/login")}
                >
                  <div className="vendor-avatar-wrapper">
                    <img src={v.avatar} alt={v.shopName || v.username} className="vendor-avatar" />
                  </div>
                  <div className="vendor-info">
                    <h3 className="vendor-name">{v.shopName || v.username}</h3>
                    <p className="vendor-username">@{v.username}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {filtered.length > 0 && (
            <section className="product-grid search-grid">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  theme={theme}
                  onClick={() => handleProductClick(p.id)}
                />
              ))}
            </section>
          )}
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

        <Link href="/search" className="nav-item active">
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

        <Link href={profileHref} className="nav-item">
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
    </>
  );
}
