"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { getInitialPreferences, resolveIcon } from "../../lib/themeUtils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tokenParams, setTokenParams] = useState({ code: null, parsed: false, email: null });
  const { theme } = useThemeIcons("clothing");
  const initialPrefs = useMemo(
    () =>
      typeof window === "undefined"
        ? { theme: "clothing", isDark: true }
        : getInitialPreferences("clothing"),
    []
  );
  const backIconSrc = resolveIcon("back", theme || initialPrefs.theme, initialPrefs.isDark);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [storedEmail, setStoredEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedEmail = localStorage.getItem("vm-reset-email");
    if (savedEmail) setStoredEmail(savedEmail);
  }, []);

  // Parse query + hash for recovery code
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const allParams = new URLSearchParams(url.search);
    const hashParams = new URLSearchParams(url.hash?.replace(/^#/, "") || "");
    const email = allParams.get("email") || hashParams.get("email");
    if (email) {
      setStoredEmail(email);
      try {
        localStorage.setItem("vm-reset-email", email);
      } catch (_) { /* ignore */ }
    }

    setTokenParams({
      code: allParams.get("code") || hashParams.get("code") || null,
      email: email || null,
      parsed: true
    });
  }, [searchParams]);

  const exchangeResetCode = async (code) => {
    const token = (code || "").trim();
    if (!token) throw new Error("Enter the code from your email.");

    // If we remember the email (same device), prefer verifyOtp to avoid PKCE errors
    if (storedEmail) {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        type: "recovery",
        token,
        email: storedEmail
      });
      if (!verifyErr) {
        setSessionReady(true);
        setStatus("");
        return;
      }
      // If verify fails, fall through to exchangeCodeForSession for hash/link cases
    }

    const { error } = await supabase.auth.exchangeCodeForSession(token);
    if (error) throw error;
    setSessionReady(true);
    setStatus("");
  };

  // Exchange code for a session
  useEffect(() => {
    if (!tokenParams.parsed) return;
    let cancelled = false;

    async function bootstrap() {
      try {
        if (tokenParams.code) {
          await exchangeResetCode(tokenParams.code);
        } else if (!cancelled) {
          setStatus("Reset link is missing or expired. Please request a new one.");
        }
      } catch (err) {
        if (!cancelled) setStatus(err.message || "This reset link is invalid or expired.");
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [tokenParams]);

  const handleManualCode = async () => {
    const code = manualCode.trim();
    if (!code) {
      setStatus("Enter the code from your email.");
      return;
    }
    setStatus("Verifying code");
    try {
      await exchangeResetCode(code);
    } catch (err) {
      setStatus(err.message || "Invalid or expired code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionReady) {
      const code = manualCode.trim() || tokenParams.code;
      if (!code) {
        setStatus("Waiting for reset link...");
        return;
      }
      setStatus("Verifying code");
      try {
        await exchangeResetCode(code);
      } catch (err) {
        setStatus(err.message || "Invalid or expired code.");
        return;
      }
    }
    if (!newPassword || newPassword.length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setLoading(true);
    setStatus("Updating password");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatus("Password updated. Redirecting to login...");
      setResetToast(true);
      setTimeout(() => setResetToast(false), 2000);
      setTimeout(() => router.replace("/login"), 1200);
    } catch (err) {
      setStatus(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
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
          <h1 style={{ margin: "0 0 12px", fontSize: "1.35rem" }}>Choose a new password</h1>
          <p className="profile-feedback-empty" style={{ marginTop: -4, marginBottom: 12 }}>
            Enter your new password below. The reset link must be opened from your email.
          </p>

          <label className="input-label" htmlFor="reset-password">
            New password
          </label>
          <input
            type="password"
            id="reset-password"
            className="input-field"
            placeholder="********"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (status) setStatus("");
            }}
          />

          <label className="input-label" htmlFor="reset-password-confirm">
            Confirm new password
          </label>
          <input
            type="password"
            id="reset-password-confirm"
            className="input-field"
            placeholder="********"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (status) setStatus("");
            }}
          />

          <button type="submit" className="btn-primary auth-button" disabled={loading}>
            {loading ? "Saving..." : "Update password"}
          </button>
          {status ? (() => {
            const s = status.trim().toLowerCase();
            const isPositive = s.startsWith("password updated");
            const isNeutral =
              s.startsWith("updating password") ||
              s.startsWith("waiting for reset link") ||
              s.startsWith("saving") ||
              s.startsWith("verifying code") ||
              s.startsWith("enter the code");
            return (
              <p className={`form-status${isPositive || isNeutral ? "" : " is-error"}`}>
                {status}
                {isNeutral ? <span className="loading-dots" aria-hidden="true"></span> : null}
              </p>
            );
          })() : null}
        </form>
      </section>

      {!sessionReady ? (
        <section className="auth-card" style={{ marginTop: 12 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>Having trouble?</h2>
          <p className="profile-feedback-empty" style={{ marginTop: 0, marginBottom: 10 }}>
            Paste the reset code from your email if the link didn&apos;t work.
          </p>
          <div style={{ display: "flex", gap: "8px", width: "100%", flexWrap: "wrap" }}>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value);
                if (status) setStatus("");
              }}
              placeholder="Reset code"
              className="reset-code-input"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn-primary"
              style={{ flex: "0 0 auto", padding: "10px 16px", minWidth: "140px" }}
              onClick={handleManualCode}
            >
              Verify code
            </button>
          </div>
        </section>
      ) : null}

      {resetToast ? (
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
              {"✓"}
            </span>
            <span>Password updated. You can log in now.</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
