"use client";

export function ProductFormSkeleton() {
  return (
    <div className="page add-product-page" aria-hidden>
      <div className="add-product-header skeleton-back-row">
        <div className="skeleton skeleton-back-btn" />
        <div className="skeleton skeleton-line skeleton-add-title-line" />
      </div>
      <div className="product-form-skeleton">
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-line skeleton-form-label" />
          <div className="skeleton skeleton-form-input" />
        </div>
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-line skeleton-form-label" />
          <div className="skeleton skeleton-form-input" />
        </div>
        <div className="product-form-skeleton-row product-form-skeleton-row-split">
          <div className="product-form-skeleton-col">
            <div className="skeleton skeleton-line skeleton-form-label short" />
            <div className="skeleton skeleton-form-input" />
          </div>
          <div className="product-form-skeleton-col">
            <div className="skeleton skeleton-line skeleton-form-label short" />
            <div className="skeleton skeleton-form-input" />
          </div>
        </div>
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-line skeleton-form-label" />
          <div className="product-form-skeleton-upload">
            <div className="skeleton skeleton-form-chip" />
            <div className="skeleton skeleton-thumb" />
          </div>
        </div>
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-line skeleton-form-label" />
          <div className="product-form-skeleton-upload">
            <div className="skeleton skeleton-form-chip" />
            <div className="product-form-skeleton-thumbs">
              <div className="skeleton skeleton-thumb" />
              <div className="skeleton skeleton-thumb" />
              <div className="skeleton skeleton-thumb" />
            </div>
          </div>
        </div>
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-line skeleton-form-label" />
          <div className="skeleton skeleton-form-textarea" />
        </div>
        <div className="product-form-skeleton-row">
          <div className="skeleton skeleton-form-button" />
        </div>
      </div>
    </div>
  );
}
