"use client";

import React, { useEffect } from "react";

export function AddProductCard({ theme = "food", onClick }) {
  useEffect(() => {
    // Trigger icon update in case we mounted after the initial scan
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vm-theme-change"));
    }
  }, []);
  return (
    <div className="product-card add-product-slot">
      <button type="button" className="profile-add-product-card" onClick={onClick}>
        <span className="profile-add-product-circle">
          <img
            src={theme === "clothing" ? "/icons/add.png" : "/icons/add-orange.png"}
            alt="Add"
            className="profile-add-product-card-icon"
            data-blue="/icons/add.png"
            data-brown="/icons/add-orange.png"
          />
        </span>
      </button>
    </div>
  );
}
