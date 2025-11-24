"use client";

import React from "react";

export function AddProductCard({ theme = "food", onClick }) {
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
