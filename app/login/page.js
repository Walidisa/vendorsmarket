"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.applySavedBodyTheme?.();
    window.updateNavIconsByTheme?.();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Logging in...");

    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    if (!emailOk) {
      setStatus("Please enter a valid email address.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data?.session) {
        throw new Error(error?.message || "Invalid credentials");
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
    <div className="page">
      <header className="page-hero auth-hero">
        <h1>Welcome back</h1>
        <p>Log in to manage your shop or keep browsing local products.</p>
      </header>

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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary auth-button">
            Log In
          </button>
          {status && <p className="form-status">{status}</p>}
        </form>

        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
