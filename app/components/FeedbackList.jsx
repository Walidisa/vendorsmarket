"use client";

import React from "react";
import { slugify } from "./slugify";

export function FeedbackList({ feedback = [] }) {
  const sorted = [...feedback].sort((a, b) => {
    const ad = Date.parse(a.createdAt || a.created_at || 0) || 0;
    const bd = Date.parse(b.createdAt || b.created_at || 0) || 0;
    return bd - ad;
  });

  return (
    <ul className="profile-feedback-list" id="profileFeedbackList">
      {sorted.map((entry, idx) => {
        const createdDate = entry.createdAt || entry.created_at;
        const d = createdDate ? new Date(createdDate) : null;
        const dateLabel =
          d && !Number.isNaN(d.getTime())
            ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : "";
        return (
          <li className="profile-feedback-item" key={`${slugify(entry.sellerId || "entry")}-${idx}`}>
            <div className="profile-feedback-item-header">
              <span className="profile-feedback-item-rating">
                <span className="rating-star">&#9733;</span> {entry.rating}
              </span>
              <span className="profile-feedback-item-date">{dateLabel}</span>
            </div>
            {entry.comment ? <p className="profile-feedback-item-comment">{entry.comment}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
