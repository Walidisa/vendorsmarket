"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const SUBCATEGORIES = [
  "snacks", "shawarma", "meals", "drinks", "cakes", "spices", "kitchenware", "food-others",
  "shoes", "jallabiya", "hijabs", "shirts", "materials", "skincare", "trousers", "hats", "bags", "watches", "tech", "clothing-others"
];

export default function CategoryIndexPage() {
  const [subs, setSubs] = useState(SUBCATEGORIES);
  // Optionally, fetch subcategories dynamically from /api/products
  // useEffect(() => { ... }, []);
  return (
    <div className="page-transition">
      <div className="page">
        <header className="subcategory-page-header">
          <h1>All Subcategories</h1>
        </header>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {subs.map((sub) => (
            <li key={sub} style={{ margin: "12px 0" }}>
              <Link href={`/category/${sub}`} className="see-all-link">
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
