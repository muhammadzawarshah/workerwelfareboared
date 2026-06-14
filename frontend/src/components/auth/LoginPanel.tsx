"use client";

import { FormEvent, useState } from "react";
import type { User } from "@/src/types";
import { API_BASE, apiRequest } from "@/src/lib/api";
import { EyeIcon, EyeOffIcon } from "@/src/components/ui/icons";

export function LoginPanel({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("secret123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await apiRequest<{ token: string; user: User }>("/auth/login", undefined, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("wwb_token", result.token);
      localStorage.setItem("wwb_user", JSON.stringify(result.user));
      onLogin(result.token, result.user);
    } catch {
      setError("Login failed. Please make sure backend is running and credentials are correct.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="login-brand-mark"><img src="/kp-logo.png" alt="KP Workers Welfare Board" /></div>
        <h1>
          Workers
          <br />
          Welfare Board
        </h1>
        <p>Secure portal for colony allotments, rent collection, utilities, complaints, and management reporting.</p>
        <div className="login-features">
          <div className="login-feature">
            <div className="feature-icon">A</div>
            <div>
              <strong>Applications</strong>
              <span>Allotment workflow management</span>
            </div>
          </div>
          <div className="login-feature">
            <div className="feature-icon">F</div>
            <div>
              <strong>Finance</strong>
              <span>Rent &amp; utility collection</span>
            </div>
          </div>
          <div className="login-feature">
            <div className="feature-icon">O</div>
            <div>
              <strong>Operations</strong>
              <span>Colony maintenance &amp; caretaker</span>
            </div>
          </div>
        </div>
      </section>
      <div className="login-right-panel">
        <section className="login-card">
          <div className="login-card-header">
            <h2>Sign in</h2>
            <p>Use your admin credentials to access the portal.</p>
          </div>
          <form onSubmit={submit}>
            <label>
              Email address
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" type="email" />
            </label>
            <label>
              Password
              <span className="password-input-wrap">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  type={showLoginPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="password-eye-button"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowLoginPassword((value) => !value)}
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </span>
            </label>
            {error ? <small className="error-msg">{error}</small> : null}
            <button type="submit">Sign in to Portal</button>
          </form>
          <span className="api-note">API: {API_BASE}</span>
        </section>
      </div>
    </main>
  );
}
