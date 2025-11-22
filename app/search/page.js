"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function SearchPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.applySavedBodyTheme?.();
      window.updateNavIconsByTheme?.();
      // Only run search-relevant inits to avoid duplicate global bindings
      window.initPageTransitions?.();
      window.initProfileNavGuard?.();
      window.initFeedbackModal?.();
    }
  }, []);

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <div className="search-hero">
            <h1>Search Products</h1>
            <p>Find items across all vendors.</p>
          </div>

          <form className="search-form">
            <input type="text" className="search-input" placeholder="Search for anything..." />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <div className="search-chips">
            <button className="search-chip">Meatpie, Spring Rolls, Puff Puff</button>
            <button className="search-chip">Shawarma, Wraps &amp; Sandwiches</button>
            <button className="search-chip">Full Meals</button>
            <button className="search-chip">Drinks, Popcorn &amp; Sweets</button>
            <button className="search-chip">Cakes &amp; Treats</button>
            <button className="search-chip">Yaji, Spices &amp; Garri</button>
            <button className="search-chip">Kitchenware</button>
            <button className="search-chip">Other Food Items</button>

            <button className="search-chip">Shoes</button>
            <button className="search-chip">Jallabiyas &amp; Abayas</button>
            <button className="search-chip">Hijabs &amp; Veils</button>
            <button className="search-chip">Shirts &amp; Gowns</button>
            <button className="search-chip">Textiles &amp; Fabrics</button>
            <button className="search-chip">Skincare, Perfumes &amp; More</button>
            <button className="search-chip">Trousers &amp; Sweatpants</button>
            <button className="search-chip">Hats</button>
            <button className="search-chip">Bags</button>
            <button className="search-chip">Watches, Jewelry &amp; More</button>
            <button className="search-chip">Tech &amp; Phone Accessories</button>
            <button className="search-chip">Other Clothing &amp; Accessories</button>
          </div>

          <section className="product-grid">
            <article className="product-card">
              <img src="/images/shoes.jpg" className="product-image" alt="Running Shoes" />
              <div className="product-info">
                <h3>Running Shoes</h3>
                <p className="price">&#8358;49,999</p>
                <p className="details">In Stock • Seller: FitGear</p>
              </div>
            </article>

            <article className="product-card">
              <img src="/images/hat.jpg" className="product-image" alt="Casual Hat" />
              <div className="product-info">
                <h3>Casual Hat</h3>
                <p className="price">&#8358;19,999</p>
                <p className="details">In Stock • Seller: StreetStyle</p>
              </div>
            </article>

            <article className="product-card">
              <img src="/images/shirt.jpg" className="product-image" alt="Graphic T-Shirt" />
              <div className="product-info">
                <h3>Graphic T-Shirt</h3>
                <p className="price">&#8358;24,999</p>
                <p className="details">In Stock • Seller: PrintHub</p>
              </div>
            </article>
          </section>
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

        <Link href="/profile" className="nav-item">
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
