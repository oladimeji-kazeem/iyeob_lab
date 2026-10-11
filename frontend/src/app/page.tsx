"use client";

import { useState } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
  env: string;
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const checkBackendHealth = async () => {
    setChecking(true);
    setBackendStatus(null);
    try {
      const res = await fetch("http://localhost:5000/api/health", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data: HealthResponse = await res.json();
        setBackendStatus(`Connected (${data.status.toUpperCase()} - ${data.env})`);
      } else {
        setBackendStatus(`HTTP ${res.status} returned`);
      }
    } catch {
      setBackendStatus("Backend service offline (Start with npm run dev:backend)");
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo-badge">U</div>
          <div>
            <div className="brand-text">Ubasify Practical Labs</div>
            <div className="brand-tag">iyeob_lab workspace</div>
          </div>
        </div>
        <div className="nav-badges">
          <div className="badge badge-online">
            <span className="status-dot"></span>
            Next.js 16 + TypeScript
          </div>
          <div className="badge">App Router</div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-pill">
            <span>✨</span> Next.js TypeScript Academic Scaffold
          </div>
          <h1 className="hero-title">
            Multi-University <span className="gradient-text">Practical Learning</span> Platform
          </h1>
          <p className="hero-subtitle">
            Welcome to the initial application foundation. Built with Next.js 16 App Router, strict
            TypeScript, custom styling, and seamless integration with our Express API service.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              id="test-backend-btn"
              className="btn-primary"
              onClick={checkBackendHealth}
              disabled={checking}
            >
              {checking ? "Checking..." : "Verify Backend API"}
            </button>
            <a
              href="https://github.com/oladimeji-kazeem/iyeob_lab"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              GitHub Repository →
            </a>
          </div>

          {backendStatus && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(13, 26, 43, 0.8)",
                border: "1px solid var(--border-glass)",
                fontSize: "0.875rem",
                display: "inline-block",
                color: backendStatus.startsWith("Connected")
                  ? "var(--lemon-green)"
                  : "var(--teal-light)",
              }}
            >
              <strong>API Probe:</strong> {backendStatus}
            </div>
          )}
        </section>

        <section className="grid">
          <article className="card">
            <div className="card-icon">⚡</div>
            <h2 className="card-title">Next.js 16 App Router</h2>
            <p className="card-description">
              Configured with React 19, strict TypeScript, custom modern CSS design system, and
              optimized client components.
            </p>
          </article>

          <article className="card">
            <div className="card-icon">🛡️</div>
            <h2 className="card-title">Code Quality & Formatting</h2>
            <p className="card-description">
              ESLint 9 integrated with Prettier for automated code quality, consistent formatting,
              and strict compile-time type verification.
            </p>
          </article>

          <article className="card">
            <div className="card-icon">🔌</div>
            <h2 className="card-title">Modular Monorepo</h2>
            <p className="card-description">
              Independent frontend and backend workspaces orchestrating the student learning
              experience, instructor grading, and institutional controls.
            </p>
          </article>
        </section>

        <section className="monitor-bar">
          <div className="monitor-item">
            <span className="monitor-label">Frontend Runtime</span>
            <span className="monitor-val">Next.js 16.4.0</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">TypeScript</span>
            <span className="monitor-val">Strict (v5)</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">Linting</span>
            <span className="monitor-val">ESLint + Prettier</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">Port</span>
            <span className="monitor-val">3000 (Default)</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2026 Ubasify Practical Labs (iyeob_lab). Built for independent multi-university practical
        education.
      </footer>
    </>
  );
}
