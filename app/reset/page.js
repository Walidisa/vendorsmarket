"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { getInitialPreferences, resolveIcon } from "../../lib/themeUtils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [storedEmail, setStoredEmail] = useState("");

  // Capture email from query/local storage for messaging
  useEffect(() => {
    if (typeof window === "undefined") return;
    const emailParam = searchParams.get("email");
    const savedEmail = localStorage.getItem("vm-reset-email");
    const nextEmail = emailParam || savedEmail || "";
    if (nextEmail) {
      setStoredEmail(nextEmail);
      try {
        localStorage.setItem("vm-reset-email", nextEmail);
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Ensure a recovery session exists (code-auth should have set it)
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          setSessionReady(true);
          if (data.user.email) {
            setStoredEmail(data.user.email);
            try {
              localStorage.setItem("vm-reset-email", data.user.email);
            } catch {
              // ignore
            }
          }
          return;
        }
        setStatus("Please verify your reset code on the code-auth page before updating your password.");
      } catch (err) {
        setStatus(err.message || "Please verify your reset code on the code-auth page first.");
      }
    };
    loadSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionReady) {
      setStatus("Please verify your reset code on the code-auth page before updating your password.");
      return;
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
            Enter your new password below.  
            {storedEmail ? ` (${storedEmail})` : ""}
          </p>

          <label className="input-label" htmlFor="reset-password">
            New password
          </label>
          <input
            type="password"
            id="reset-password"
            className="input-field"
            placeholder="********"
            autoComplete="new-password"
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
            autoComplete="new-password"
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
            const isNeutral = s.startsWith("updating password") || s.startsWith("saving");
            return (
              <p className={`form-status${isPositive || isNeutral ? "" : " is-error"}`}>
                {status}
                {isNeutral ? <span className="loading-dots" aria-hidden="true"></span> : null}
              </p>
            );
          })() : null}
        </form>
      </section>

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
              {"\u2713"}
            </span>
            <span>Password updated. You can log in now.</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
