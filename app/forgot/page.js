"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { getInitialPreferences, resolveIcon } from "../../lib/themeUtils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme } = useThemeIcons("clothing");
  const initialPrefs = useMemo(
    () =>
      typeof window === "undefined"
        ? { theme: "clothing", isDark: true }
        : getInitialPreferences("clothing"),
    []
  );
  const backIconSrc = resolveIcon("back", theme || initialPrefs.theme, initialPrefs.isDark);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending reset link");

    const emailVal = email.trim();
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal);
    if (!emailOk) {
      setStatus("Please enter a valid email address.");
      return;
    }

    try {
      // First check if the email exists to avoid generic "sent" messages
      const existsRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal })
      });
      if (!existsRes.ok) {
        const { error } = await existsRes.json().catch(() => ({ error: "No account found with that email." }));
        setStatus(error || "No account found with that email.");
        return;
      }
      const { exists } = await existsRes.json();
      if (!exists) {
        setStatus("No account found with that email.");
        return;
      }

      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
      const redirectTo = `${baseUrl}/reset?email=${encodeURIComponent(emailVal)}`;

      const { error } = await supabase.auth.resetPasswordForEmail(emailVal, {
        redirectTo
      });
      if (error) throw error;

      if (typeof window !== "undefined") {
        localStorage.setItem("vm-reset-email", emailVal);
      }

      setStatus("Check your email for a reset link. \u2713");
    } catch (err) {
      setStatus(err.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="page auth-page">
      <div className="add-product-header">
        <button type="button" className="back-button" onClick={() => router.back()}>
          <img
            src={backIconSrc || (theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png")}
            alt="Back"
            className="back-icon"
            data-icon="back"
            data-blue="/icons/back.png"
            data-brown="/icons/back-orange.png"
          />
        </button>
      </div>

      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 style={{ margin: "0 0 12px", fontSize: "1.35rem" }}>Reset your password</h1>
          <p className="profile-feedback-empty" style={{ marginTop: -4, marginBottom: 12 }}>
            Enter the email tied to your account and we&apos;ll send a reset link.
          </p>

          <label className="input-label" htmlFor="forgot-email">
            Email
          </label>
          <input
            type="email"
            id="forgot-email"
            className="input-field"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status) setStatus("");
            }}
          />

          <button type="submit" className="btn-primary auth-button">
            Send reset link
          </button>
          {status ? (() => {
            const s = status.trim().toLowerCase();
            const isPositive = s.startsWith("check your email");
            const isNeutral = s.startsWith("sending reset link");
            return (
              <p className={`form-status${isPositive || isNeutral ? "" : " is-error"}`}>
                {status}
                {isNeutral ? <span className="loading-dots" aria-hidden="true"></span> : null}
              </p>
            );
          })() : null}
        </form>
      </section>
    </div>
  );
}
