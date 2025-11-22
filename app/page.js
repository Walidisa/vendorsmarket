"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
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

  return (
    <>
      <div className="page">
        <div className="hero-image-container">
          <img src="/images/hero.jpg" className="hero-image" alt="" />
        </div>

        <header className="page-hero">
          <h1>Shop local. Sell global.</h1>
          <p>
            Discover unique products from independent small businesses, all in one place. Support real
            people, not big corporations.
          </p>

          <div className="hero-actions">
            <Link href="/homepage">
              <button className="btn-primary">Browse shops</button>
            </Link>
            <Link href="/signup">
              <button className="btn-secondary">Become a seller</button>
            </Link>
          </div>
        </header>

        <section className="card-grid">
          <article className="card">
            <h2>One marketplace, many small businesses</h2>
            <p>
              Explore clothing, crafts, food, services and more from trusted local vendors. Each shop has
              its own story.
            </p>
          </article>

          <article className="card">
            <h2>Tools that help sellers grow</h2>
            <p>
              Simple dashboards, easy payouts, and mobile tools so businesses can focus on creating great
              products.
            </p>
          </article>

          <article className="card">
            <h2>Support local communities</h2>
            <p>Your purchases empower real people and help local economies grow stronger.</p>
          </article>
        </section>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
