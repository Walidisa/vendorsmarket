"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

export default function LoginPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initLogin = () => {
      if (typeof window === "undefined") return false;
      window.applySavedBodyTheme?.();
      window.updateNavIconsByTheme?.();
      window.initAuth?.();
      window.initFeedbackModal?.();
      setReady(true);
      return true;
    };

    if (initLogin()) return undefined;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (initLogin() || attempts > 12) {
        clearInterval(interval);
        setReady(true);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (!ready) {
    return <div style={{ minHeight: "100vh", background: "#fff" }} />;
  }

  return (
    <>
      <div className="page">
        <header className="page-hero auth-hero">
          <h1>Welcome back</h1>
          <p>Log in to manage your shop or keep browsing local products.</p>
        </header>

        <section className="auth-card">
          <form className="auth-form">
            <label className="input-label" htmlFor="login-email">
              Email
            </label>
            <input type="email" id="login-email" className="input-field" placeholder="you@example.com" required />

            <label className="input-label" htmlFor="login-password">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              className="input-field"
              placeholder="********"
              required
            />

            <button type="submit" className="btn-primary auth-button">
              Log In
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </section>
      </div>
      <Script src="/scripts/main.js" strategy="afterInteractive" />
    </>
  );
}
