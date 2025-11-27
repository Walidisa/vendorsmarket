"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../../lib/useData";
import { useSessionVendor } from "../../lib/useSessionVendor";
import { useThemeIcons } from "../../lib/useThemeIcons";

const CATEGORIES = [
  { value: "food", label: "Food & snacks", icon: "/icons/food.png" },
  { value: "clothing", label: "Clothing & accessories", icon: "/icons/clothes.png" },
];

const SUBROWS = {
  food: [
    { value: "snacks", label: "Meatpie, Spring Rolls, Puff Puff & More Fried Snacks" },
    { value: "shawarma", label: "Shawarma, Wraps, Sandwiches & More" },
    { value: "meals", label: "Full Meals" },
    { value: "drinks", label: "Drinks, Popcorn, Sweets & More" },
    { value: "cakes", label: "Cakes, Donuts, Cinnamon Rolls & More Tasty Treats" },
    { value: "spices", label: "Yaji, Spices, Garri & More" },
    { value: "kitchenware", label: "Kitchenware" },
    { value: "food-others", label: "Other Food Items" },
  ],
  clothing: [
    { value: "shoes", label: "Shoes" },
    { value: "jallabiya", label: "Jallabiyas & Abayas" },
    { value: "hijabs", label: "Hijabs & Veils" },
    { value: "shirts", label: "Shirts & Gowns" },
    { value: "materials", label: "Textile, Fabrics & Traditional Clothing" },
    { value: "skincare", label: "Hair Products, Skincare, Perfumes & More" },
    { value: "trousers", label: "Trousers & Sweatpants" },
    { value: "hats", label: "Hats" },
    { value: "bags", label: "Bags" },
    { value: "watches", label: "Watches, Jewelry, Glasses & More" },
    { value: "tech", label: "Tech & Phone Accessories" },
    { value: "clothing-others", label: "Other Clothing & Accessories" },
  ],
};

export default function Homepage() {
  const { vendor } = useSessionVendor();
  const { products = [] } = useProducts();
  const router = useRouter();
  const { theme, setTheme } = useThemeIcons("food");
  const [profileHref, setProfileHref] = useState("/login");
  const [activeCategory, setActiveCategory] = useState("food");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("activeTheme") : null;
    const initial = saved === "clothing" ? "clothing" : "food";
    setActiveCategory(initial);
    setTheme(initial);
  }, [setTheme]);

  useEffect(() => {
    if (vendor?.username) {
      setProfileHref(`/profile/${vendor.username}`);
    } else {
      setProfileHref("/login");
    }
  }, [vendor]);

  const grouped = useMemo(() => {
    const cat = activeCategory;
    const rows = SUBROWS[cat] || [];
    const filtered = products.filter((p) => p.mainCategory === cat);
    const bySub = new Map();
    rows.forEach((row) => bySub.set(row.value, []));
    filtered.forEach((p) => {
      const arr = bySub.get(p.subCategory);
      if (arr) arr.push(p);
    });
    return rows.map((row) => ({
      ...row,
      items: bySub.get(row.value) || [],
    }));
  }, [products, activeCategory]);

  const handleSeeAll = (main, sub, title) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("subcategoryMain", main);
      localStorage.setItem("subcategorySlug", sub);
      localStorage.setItem("subcategoryTitle", title || sub);
    }
    router.push(`/category/${sub}`);
  };

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
          <div className="category-toggle-icons">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`category-icon-btn${activeCategory === cat.value ? " active" : ""}`}
                data-category={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setTheme(cat.value);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("activeTheme", cat.value);
                  }
                }}
              >
                <div className="category-icon-wrapper">
                  <img src={cat.icon} className="category-icon-large" alt="" />
                </div>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <section className="subcategory-rows" id="subcategoryRows">
            {grouped.map((row) => (
              <div
                key={`${activeCategory}-${row.value}`}
                className="subcategory-row"
                data-category={activeCategory}
                data-subcategory={row.value}
                style={{ display: activeCategory === activeCategory ? "block" : "none" }}
              >
                <header className="subcategory-row-header">
                  <h2 className="subcategory-title">{row.label}</h2>
                  <button
                    className="subcategory-see-all"
                    data-subcategory={row.value}
                    onClick={() => handleSeeAll(activeCategory, row.value, row.label)}
                  >
                    See all
                  </button>
                </header>
                <div className="subcategory-row-scroll" data-products-group={`${activeCategory}:${row.value}`}>
                  {row.items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      theme={theme}
                      onClick={() => handleProductClick(p.id)}
                    />
                  ))}
                  {!row.items.length ? (
                    <p className="subcategory-empty">No products yet.</p>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      <nav className="bottom-nav">
        <Link href="/homepage" className="nav-item active">
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
