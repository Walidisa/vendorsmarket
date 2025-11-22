"use client";

import Script from "next/script";

export default function ProductPage() {
  return (
    <>
      <div className="page-transition">
        <div className="page product-detail-page">
          <header className="product-detail-header">
            <button className="back-button" id="productBackBtn" aria-label="Back">
              <img
                src="/icons/back.png"
                alt="Back"
                className="back-icon"
                data-blue="/icons/back.png"
                data-brown="/icons/back-orange.png"
              />
            </button>
            <h1 id="productTitle">Product</h1>
          </header>

          <section className="product-detail-main" id="productDetailMain"></section>
        </div>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
