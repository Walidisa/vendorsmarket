"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useThemeIcons } from "../../lib/useThemeIcons";
import { getInitialPreferences, resolveIcon } from "../../lib/themeUtils";

export default function CodeAuthPage() {
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

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const autoAttempted = useRef(false);

  // Parse URL params for token/email/access tokens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const query = new URLSearchParams(url.search);
    const hash = new URLSearchParams(url.hash?.replace(/^#/, "") || "");

    const token =
      query.get("token") ||
      hash.get("token") ||
      hash.get("token_hash") ||
      query.get("token_hash") ||
      query.get("code") ||
      hash.get("code") ||
      "";
    const emailParam = query.get("email") || hash.get("email") || "";
    if (token) setCode(token);
    if (emailParam) {
      try {
        localStorage.setItem("vm-reset-email", emailParam);
      } catch (_) {
        // ignore
      }
    }
  }, [searchParams]);

  const resolveEmail = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vm-reset-email");
      if (stored) return stored;
    }
    return "";
  };

  const setSessionFromTokens = async () => {
    if (typeof window === "undefined") return { ok: false, email: null };
    const url = new URL(window.location.href);
    const query = new URLSearchParams(url.search);
    const hash = new URLSearchParams(url.hash?.replace(/^#/, "") || "");
    const accessToken = hash.get("access_token") || query.get("access_token");
    const refreshToken = hash.get("refresh_token") || query.get("refresh_token");
    if (!accessToken || !refreshToken) return { ok: false, email: null };

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) throw error;

    let sessionEmail = null;
    const { data: userData } = await supabase.auth.getUser();
    sessionEmail = userData?.user?.email || null;
    if (sessionEmail) {
      try {
        localStorage.setItem("vm-reset-email", sessionEmail);
      } catch {
        // ignore
      }
      setEmail((prev) => prev || sessionEmail);
    }
    return { ok: true, email: sessionEmail };
  };

  const redirectToReset = async (resolvedEmail) => {
    try {
      if (resolvedEmail) {
        localStorage.setItem("vm-reset-email", resolvedEmail);
      }
    } catch (_) {
      // ignore
    }
    const emailParam = resolvedEmail ? `?email=${encodeURIComponent(resolvedEmail)}` : "";
    router.replace(`/reset${emailParam}`);
  };

  const handleVerify = async (tokenInput) => {
    const token = (tokenInput || code || "").trim();
    if (!token) {
      setStatus("Enter the code from your email.");
      return;
    }

    setLoading(true);
    setStatus("Verifying code");
    try {
      // If hash tokens are present, set session first (works cross-device, no email needed)
      const { ok: setOk, email: sessionEmail } = await setSessionFromTokens();
      if (!setOk) {
        const emailToUse = resolveEmail();
        if (!emailToUse) {
          setStatus("Enter the account email to verify this code.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token,
          email: emailToUse
        });
        if (error) throw error;
      }

      const finalEmail = sessionEmail || resolveEmail();
      await redirectToReset(finalEmail);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("token has expired") || msg.toLowerCase().includes("expired")) {
        setStatus("Code is incorrect or expired.");
      } else {
        setStatus(msg || "Code is incorrect or expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when token + email are present
  useEffect(() => {
    const token = (code || "").trim();
    if (!token || autoAttempted.current) return;
    autoAttempted.current = true;
    handleVerify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Fast path: if access/refresh tokens are already present in the URL hash, set session and go.
  useEffect(() => {
    const bootstrap = async () => {
      if (autoAttempted.current) return;
      try {
        const { ok, email: sessionEmail } = await setSessionFromTokens();
        if (ok) {
          autoAttempted.current = true;
          await redirectToReset(sessionEmail);
        }
      } catch (err) {
        // fall back to normal flow; status will be set by other handlers
        console.error("Auto session from tokens failed", err);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <h1 style={{ margin: "0 0 12px", fontSize: "1.35rem" }}>Verify your reset code</h1>
        <p className="profile-feedback-empty" style={{ marginTop: -4, marginBottom: 12 }}>
          Paste the 8-digit code from your email.
        </p>


        <label className="input-label" htmlFor="code-auth-code">
          Reset code
        </label>
        <input
          id="code-auth-code"
          type="text"
          className="input-field"
          placeholder="Enter code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status) setStatus("");
          }}
          autoComplete="one-time-code"
        />
        {!status ? (
          <p className="form-status">
            Check your email for the reset code. ✓ (may take a few minutes on the first try)
          </p>
        ) : null}
        <div style={{ width: "100%", textAlign: "left", marginTop: 6, marginBottom: 10 }}>
          <button
            type="button"
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              padding: 0,
              textDecoration: "underline",
              cursor: "pointer"
            }}
            onClick={async () => {
              try {
                setStatus("Sending a new code");
                const email = resolveEmail();
                if (!email) {
                  setStatus("Enter your account email on the forgot page to resend the code.");
                  return;
                }
                const baseUrl =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
                const redirectTo = `${baseUrl}/code-auth?email=${encodeURIComponent(email)}`;
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
                if (error) throw error;
                setStatus("Check your email for the new code. \u2713");
              } catch (err) {
                setStatus(err.message || "Failed to resend code.");
              }
            }}
          >
            Resend code?
          </button>
        </div>
        <button
          type="button"
          className="btn-primary auth-button"
          onClick={() => handleVerify()}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify code"}
        </button>

        {status ? (() => {
          const s = status.trim().toLowerCase();
          const isNeutral =
            s.startsWith("verifying") ||
            s.startsWith("sending a new code") ||
            s.startsWith("check your email");
          const showDots = s.startsWith("verifying") || s.startsWith("sending a new code");
          return (
            <p className={`form-status${isNeutral ? "" : " is-error"}`}>
              {status}
              {showDots ? <span className="loading-dots" aria-hidden="true"></span> : null}
            </p>
          );
        })() : null}
      </section>
    </div>
  );
}
