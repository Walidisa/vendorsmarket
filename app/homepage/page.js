"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function Homepage() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.runAllInitializers === "function") {
      window.runAllInitializers();
    }
  }, []);

  return (
    <>
      <div className="page-transition">
        <div className="page">
          <div className="category-toggle-icons">
            <button className="category-icon-btn active" data-category="food">
              <div className="category-icon-wrapper">
                <img src="/icons/food.png" className="category-icon-large" alt="" />
              </div>
              <span className="category-label">Food &amp; snacks</span>
            </button>

            <button className="category-icon-btn" data-category="clothing">
              <div className="category-icon-wrapper">
                <img src="/icons/clothes.png" className="category-icon-large" alt="" />
              </div>
              <span className="category-label">Clothing &amp; accessories</span>
            </button>
          </div>

          <section className="subcategory-rows" id="subcategoryRows">
            <div className="subcategory-row" data-category="food" data-subcategory="snacks">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Meatpie, Spring Rolls, Puff Puff &amp; More Fried Snacks</h2>
                <button className="subcategory-see-all" data-subcategory="snacks">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:snacks"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="shawarma">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Shawarma, Wraps, Sandwiches &amp; More</h2>
                <button className="subcategory-see-all" data-subcategory="shawarma">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:shawarma"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="meals">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Full Meals</h2>
                <button className="subcategory-see-all" data-subcategory="meals">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:meals"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="drinks">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Drinks, Popcorn, Sweets &amp; More</h2>
                <button className="subcategory-see-all" data-subcategory="drinks">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:drinks"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="cakes">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Cakes, Donuts, Cinnamon Rolls &amp; More Tasty Treats</h2>
                <button className="subcategory-see-all" data-subcategory="cakes">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:cakes"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="spices">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Yaji, Spices, Garri &amp; More</h2>
                <button className="subcategory-see-all" data-subcategory="spices">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:spices"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="kitchenware">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Kitchenware</h2>
                <button className="subcategory-see-all" data-subcategory="kitchenware">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:kitchenware"></div>
            </div>

            <div className="subcategory-row" data-category="food" data-subcategory="food-others">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Other Food Items</h2>
                <button className="subcategory-see-all" data-subcategory="food-others">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="food:food-others"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="shoes">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Shoes</h2>
                <button className="subcategory-see-all" data-subcategory="shoes">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:shoes"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="jallabiya">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Jallabiyas &amp; Abayas</h2>
                <button className="subcategory-see-all" data-subcategory="jallabiya">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:jallabiya"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="hijabs">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Hijabs &amp; Veils</h2>
                <button className="subcategory-see-all" data-subcategory="hijabs">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:hijabs"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="shirts">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Shirts &amp; Gowns</h2>
                <button className="subcategory-see-all" data-subcategory="shirts">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:shirts"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="materials">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Textiles &amp; Fabrics</h2>
                <button className="subcategory-see-all" data-subcategory="materials">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:materials"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="skincare">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Hair Products, Skincare, Perfumes &amp; More</h2>
                <button className="subcategory-see-all" data-subcategory="skincare">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:skincare"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="trousers">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Trousers &amp; Sweatpants</h2>
                <button className="subcategory-see-all" data-subcategory="trousers">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:trousers"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="hats">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Hats</h2>
                <button className="subcategory-see-all" data-subcategory="hats">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:hats"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="bags">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Bags</h2>
                <button className="subcategory-see-all" data-subcategory="bags">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:bags"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="watches">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Watches, Jewelry, Glasses &amp; More</h2>
                <button className="subcategory-see-all" data-subcategory="watches">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:watches"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="tech">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Tech &amp; Phone Accessories</h2>
                <button className="subcategory-see-all" data-subcategory="tech">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:tech"></div>
            </div>

            <div className="subcategory-row" data-category="clothing" data-subcategory="clothing-others">
              <header className="subcategory-row-header">
                <h2 className="subcategory-title">Other Clothing &amp; Accessories</h2>
                <button className="subcategory-see-all" data-subcategory="clothing-others">
                  See all
                </button>
              </header>
              <div className="subcategory-row-scroll" data-products-group="clothing:clothing-others"></div>
            </div>
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
