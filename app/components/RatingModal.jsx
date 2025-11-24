"use client";

import React from "react";
import { createPortal } from "react-dom";

export function RatingModal({
  open,
  title = "Rate",
  subtitle,
  options = [1, 2, 3, 4, 5],
  selected,
  onSelect,
  comment,
  onCommentChange,
  commentPlaceholder,
  onCancel,
  onConfirm,
  confirmLabel = "Send",
  confirmDisabled = false,
  onRemove,
  removeLabel = "Remove rating",
  overlayStyle,
  usePortal = true,
}) {
  if (!open) return null;

  const content = (
    <div
      className="rating-overlay is-visible"
      style={
        overlayStyle || {
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.45)",
        }
      }
    >
      <div className="rating-dialog">
        <h2>{title}</h2>
        {subtitle ? <p className="rating-dialog-sub">{subtitle}</p> : null}
        <div className="rating-buttons">
          {options.map((val) => (
            <button
              key={val}
              type="button"
              className={`rating-value-btn${selected === val ? " is-selected" : ""}`}
              onClick={() => onSelect?.(val)}
            >
              {val}
            </button>
          ))}
        </div>
        {typeof comment !== "undefined" && onCommentChange ? (
          <textarea
            className="feedback-comment"
            rows="3"
            placeholder={commentPlaceholder || "Add a short comment (optional)"}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />
        ) : null}
        <div className="rating-dialog-actions">
          <button type="button" className="rating-cancel" onClick={onCancel}>
            Cancel
          </button>
          {onRemove ? (
            <button
              type="button"
              className="rating-confirm"
              onClick={onRemove}
              disabled={confirmDisabled}
            >
              {removeLabel}
            </button>
          ) : null}
          {onConfirm ? (
            <button
              type="button"
              className="rating-confirm"
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (usePortal && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
