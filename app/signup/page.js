"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="page">
      <header className="page-hero auth-hero">
        <h1>Create your account</h1>
        <p>Join as a shopper or seller and support small businesses.</p>
      </header>

      <section className="auth-card">
        <form className="auth-form">
          <label className="input-label" htmlFor="signup-name">
            Full name
          </label>
          <input type="text" id="signup-name" className="input-field" placeholder="Alex Doe" required />

          <label className="input-label" htmlFor="signup-email">
            Email
          </label>
          <input type="email" id="signup-email" className="input-field" placeholder="you@example.com" required />

          <label className="input-label" htmlFor="signup-password">
            Password
          </label>
          <input
            type="password"
            id="signup-password"
            className="input-field"
            placeholder="Create a password"
            required
          />

          <label className="input-label" htmlFor="signup-confirm">
            Confirm password
          </label>
          <input
            type="password"
            id="signup-confirm"
            className="input-field"
            placeholder="Repeat your password"
            required
          />

          <button type="submit" className="btn-primary auth-button">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </div>
  );
}
