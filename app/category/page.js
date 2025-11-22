"use client";

import Script from "next/script";

export default function CategoryPage() {
  return (
    <>
      <div className="page-transition">
        <div className="page">
          <header className="subcategory-page-header">
            <button className="back-button" id="subcategoryBackBtn" aria-label="Back to home">
              <img
                src="/icons/back.png"
                alt="Back"
                className="back-icon"
                data-blue="/icons/back.png"
                data-brown="/icons/back-orange.png"
              />
            </button>
            <h1 id="subcategoryTitle">Products</h1>
          </header>

          <section className="subcategory-page-grid" id="subcategoryPageGrid"></section>
        </div>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
