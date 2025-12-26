"use client";

import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminTarget, setAdminTarget] = useState({ userId: null, username: "admin" });
  const [sentToast, setSentToast] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    async function loadAdminTarget() {
      try {
        const res = await fetch("/api/profiles", { cache: "no-store" });
        if (!res.ok) return;
        const profiles = (await res.json()) || [];
        const adminProfile = profiles.find(
          (p) => (p.username || "").toLowerCase() === "admin"
        );
        if (adminProfile) {
          setAdminTarget({
            userId: adminProfile.userId || null,
            username: adminProfile.username || "admin"
          });
        }
      } catch {
        // ignore
      }
    }
    loadAdminTarget();
  }, []);

  return (
    <div id="site-footer">
      <div
        className={`feedback-overlay${open ? " is-open" : ""}`}
        id="feedbackOverlay"
        aria-hidden={open ? "false" : "true"}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="feedback-backdrop"></div>

        <div className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
          <button
            className="feedback-close"
            id="closeFeedback"
            aria-label="Close feedback form"
            type="button"
            onClick={close}
          >
            <img src="/icons/close.png" alt="Close" className="feedback-close-icon" />
          </button>

          <h2 id="feedbackTitle" className="feedback-title">
            Contact &amp; Feedback
          </h2>
          <p className="feedback-subtitle">
            Tell us what you think about Vendors Market, or report an issue.
          </p>

          <form
            className="feedback-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (submitting) return;
              if (!adminTarget.userId) {
                alert("Admin contact not configured yet. Please try again later.");
                return;
              }
              setSubmitting(true);
              try {
                const trimmedMessage = message.trim();
                const body = {
                  vendor_user_id: adminTarget.userId,
                  vendor_username: adminTarget.username,
                  rating: 5,
                  message: trimmedMessage
                    ? `${trimmedMessage}\n\nSent by: ${name || "Anonymous"}${email ? ` (${email})` : ""}`
                    : `Sent by: ${name || "Anonymous"}${email ? ` (${email})` : ""}`
                };
                await fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body)
                });
                setMessage("");
                setName("");
                setEmail("");
                close();
                setSentToast(true);
                setTimeout(() => setSentToast(false), 2200);
              } catch (err) {
                console.error("Failed to submit feedback", err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <label className="input-label" htmlFor="fb-name">
              Name (optional)
            </label>
            <input
              id="fb-name"
              type="text"
              className="input-field"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="input-label" htmlFor="fb-email">
              Email (optional)
            </label>
            <input
              id="fb-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="input-label" htmlFor="fb-message">
              Message
            </label>
            <textarea
              id="fb-message"
              className="input-field feedback-textarea"
              rows="4"
              placeholder="Share your feedback or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            <button
              type="submit"
              className="btn-primary feedback-submit"
              disabled={submitting}
            >
              {submitting ? "Sending" : "Send feedback"}
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-section">
          <h3>Vendors Market</h3>
          <p>Shop local. Support small businesses.</p>
        </div>

        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <ThemeToggle />
        </div>

        <button
          className="footer-feedback-btn"
          id="openFeedback"
          type="button"
          onClick={() => setOpen(true)}
        >
          Contact &amp; Feedback
        </button>

        <p className="footer-copy">© 2025 Vendors Market</p>
      </footer>
      {sentToast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card-bg)",
            color: "var(--color-text)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            borderRadius: "12px",
            padding: "12px 16px",
            zIndex: 12000,
            maxWidth: "520px",
            width: "calc(100% - 24px)",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "0.95rem"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              width: "100%"
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#16a34a",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 800,
                lineHeight: 1
              }}
              aria-hidden="true"
            >
              ✓
            </span>
            <span>Message sent! We received your feedback.</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
