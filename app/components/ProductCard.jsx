"use client";

import React from "react";

export function ProductCard({
  product,
  theme = "food",
  isOwner = false,
  onClick,
  onEdit,
  onDelete,
  showVendor = true,
}) {
  if (!product) return null;

  const showRating =
    typeof product.ratingValue === "number" && typeof product.ratingCount === "number";

  return (
    <article
      className="product-card"
      data-category={product.mainCategory}
      data-subcategory={product.subCategory}
      data-product-id={product.id}
      onClick={onClick}
    >
      <div className="product-image-wrapper">
        <div className="product-image-box">
          <div className="image-bg-extend"></div>
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">&#8358;{Number(product.price || 0).toLocaleString()}</p>
        {showRating ? (
          <p className="rating">
            <span className="rating-star">&#9733;</span>
            <span id="productRatingValue">{product.ratingValue.toFixed(1)}</span> (
            <span id="productRatingCount">{product.ratingCount}</span>)
          </p>
        ) : null}
        {showVendor ? (
          <p className="vendor-name-line">
            {product.vendorShopName || product.vendor || product.vendorUsername || ""}
          </p>
        ) : null}
      </div>
      {isOwner && (
        <div
          className="profile-card-actions"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            className="profile-card-btn profile-card-edit"
            aria-label="Edit product"
            onClick={onEdit}
          >
            <img
              src={theme === "clothing" ? "/icons/edit.png" : "/icons/edit-orange.png"}
              alt="Edit"
              className="profile-card-btn-icon"
            />
          </button>
          <button
            type="button"
            className="profile-card-btn profile-card-delete"
            aria-label="Delete product"
            onClick={onDelete}
          >
            <img src="/icons/delete.png" alt="Delete" className="profile-card-btn-icon" />
          </button>
        </div>
      )}
    </article>
  );
}
