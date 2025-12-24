"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useThemeIcons } from "../../lib/useThemeIcons";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useThemeIcons("clothing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Logging in");

    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    if (!emailOk) {
      setStatus("Please enter a valid email address.");
      return;
    }

    try {
      // Clear any stale session before attempting a fresh sign-in (helps in PWA/SW scenarios).
      await supabase.auth.signOut({ scope: "global" }).catch(() => supabase.auth.signOut().catch(() => {}));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data?.session) {
        throw new Error(error?.message || "Invalid credentials");
      }

      // Ensure the returned session is persisted.
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }).catch(() => {});
      }

      // Resolve vendor by session user_id
      let profiles = [];
      try {
        const res = await fetch("/api/profiles");
        profiles = res.ok ? await res.json() : [];
      } catch (e) {
        profiles = [];
      }
      const vendor = profiles.find((p) => p.userId === data.session.user.id) || null;
      const slug = vendor?.username ? vendor.username : "";
      router.replace(slug ? `/profile/${slug}` : "/profile");
    } catch (err) {
      setStatus(err.message || "Login failed");
    }
  };

  return (
    <div className="page auth-page">
      <div className="add-product-header">
        <button type="button" className="back-button" onClick={() => router.back()}>
          <img
            src={theme === "clothing" ? "/icons/back.png" : "/icons/back-orange.png"}
            alt="Back"
            className="back-icon"
            data-blue="/icons/back.png"
            data-brown="/icons/back-orange.png"
          />
        </button>
      </div>
      <section className="auth-card">
        <form className="auth-form" data-react-login="1" onSubmit={handleSubmit}>
          <label className="input-label" htmlFor="login-email">
            Email
          </label>
          <input
            type="email"
            id="login-email"
            className="input-field"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status) setStatus("");
            }}
          />

          <label className="input-label" htmlFor="login-password">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            className="input-field"
            placeholder="********"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (status) setStatus("");
            }}
          />

          <button type="submit" className="btn-primary auth-button">
            Log In
          </button>
          {status ? (() => {
            const s = status.trim().toLowerCase();
            const isNeutral = s.startsWith('saving') || s.startsWith('logging');
            const showDots = s.startsWith('logging') || s.startsWith('saving');
            return (
              <p className={`form-status${isNeutral ? '' : ' is-error'}`}>
                {status}{showDots ? <span className="loading-dots" aria-hidden="true"></span> : null}
              </p>
            );
          })() : null}
        </form>

        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
