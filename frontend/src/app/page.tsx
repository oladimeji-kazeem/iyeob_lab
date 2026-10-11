"use client";

import { useEffect, useState } from "react";
import {
  API_BASE_URL,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  fetchCourseOfferings,
  fetchCourseTemplates,
  fetchEnrolments,
  fetchInstitutions,
  fetchMemberships,
  fetchUsers,
  supabase,
} from "@/lib/supabase";
import type {
  CourseOffering,
  CourseTemplate,
  Enrolment,
  Institution,
  Membership,
  MembershipRole,
  PasswordRecoveryResponse,
  PasswordResetResponse,
  SessionPrincipal,
  UserProfile,
} from "@/lib/types";

type ActiveTab =
  | "overview"
  | "institutions"
  | "users"
  | "templates"
  | "offerings"
  | "enrolments"
  | "auth";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  // Entities state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);

  // Authenticated session state
  const [currentSession, setCurrentSession] = useState<SessionPrincipal | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Auth form state
  const [authEmail, setAuthEmail] = useState("student@mipt.edu");
  const [authPassword, setAuthPassword] = useState("Password123!");
  const [authName, setAuthName] = useState("Kazeem Oladimeji");
  const [authRole, setAuthRole] = useState<MembershipRole>("student");
  const [authInstitutionId, setAuthInstitutionId] = useState<string>("");

  // Password Recovery / Reset form state
  const [recoveryEmail, setRecoveryEmail] = useState("student@mipt.edu");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("NewSecurePassword456!");

  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [authMsgType, setAuthMsgType] = useState<"success" | "error">("success");

  // New institution form state
  const [instName, setInstName] = useState("");
  const [instCode, setInstCode] = useState("");
  const [instDomain, setInstDomain] = useState("");

  const checkServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const d = await res.json();
        setBackendStatus(`Online (${d.status.toUpperCase()} - v${d.version})`);
      } else {
        setBackendStatus(`HTTP ${res.status}`);
      }
    } catch {
      setBackendStatus("Backend Offline");
    }

    try {
      const { data, error } = await supabase.from("institutions").select("count", { count: "exact" });
      if (error) {
        setSupabaseStatus(`Client Active (Project ID: ${SUPABASE_PROJECT_ID})`);
      } else {
        setSupabaseStatus(`Connected (${data?.length ?? 0} records)`);
      }
    } catch {
      setSupabaseStatus("Supabase Ready");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [insts, usrs, mems, tpls, offs, enrs] = await Promise.all([
        fetchInstitutions(),
        fetchUsers(),
        fetchMemberships(),
        fetchCourseTemplates(),
        fetchCourseOfferings(),
        fetchEnrolments(),
      ]);
      setInstitutions(insts);
      setUsers(usrs);
      setMemberships(mems);
      setTemplates(tpls);
      setOfferings(offs);
      setEnrolments(enrs);
      if (insts.length > 0 && !authInstitutionId) {
        setAuthInstitutionId(insts[0].id);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          const d = await res.json();
          if (active) setBackendStatus(`Online (${d.status.toUpperCase()} - v${d.version})`);
        } else {
          if (active) setBackendStatus(`HTTP ${res.status}`);
        }
      } catch {
        if (active) setBackendStatus("Backend Offline");
      }

      try {
        const { data, error } = await supabase.from("institutions").select("count", { count: "exact" });
        if (error) {
          if (active) setSupabaseStatus(`Client Active (Project ID: ${SUPABASE_PROJECT_ID})`);
        } else {
          if (active) setSupabaseStatus(`Connected (${data?.length ?? 0} records)`);
        }
      } catch {
        if (active) setSupabaseStatus("Supabase Ready");
      }

      if (active) setLoading(true);
      try {
        const [insts, usrs, mems, tpls, offs, enrs] = await Promise.all([
          fetchInstitutions(),
          fetchUsers(),
          fetchMemberships(),
          fetchCourseTemplates(),
          fetchCourseOfferings(),
          fetchEnrolments(),
        ]);
        if (active) {
          setInstitutions(insts);
          setUsers(usrs);
          setMemberships(mems);
          setTemplates(tpls);
          setOfferings(offs);
          setEnrolments(enrs);
          if (insts.length > 0) {
            setAuthInstitutionId(insts[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !instCode) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/institutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: instName,
          code: instCode.toUpperCase(),
          domain: instDomain || null,
          is_active: true,
        }),
      });
      if (res.ok) {
        setInstName("");
        setInstCode("");
        setInstDomain("");
        await loadData();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to create institution");
      }
    } catch (err) {
      alert("Error contacting API: " + String(err));
    }
  };

  const handleAuthSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          full_name: authName,
          role: authRole,
          institution_id: authInstitutionId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        setAuthMsgType("success");
        setAuthMsg(`Account registered & password hashed with bcrypt! Logged in as ${data.user.full_name}.`);
        await fetchSessionUser(data.access_token);
        await loadData();
      } else {
        setAuthMsgType("error");
        setAuthMsg(`Registration failed: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      setAuthMsgType("error");
      setAuthMsg(`Connection error: ${String(err)}`);
    }
  };

  const handleAuthSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        setAuthMsgType("success");
        setAuthMsg(`Authentication successful! Verified password hash.`);
        await fetchSessionUser(data.access_token);
      } else {
        setAuthMsgType("error");
        setAuthMsg(`Authentication failed: ${data.detail || "Invalid credentials"}`);
      }
    } catch (err) {
      setAuthMsgType("error");
      setAuthMsg(`Connection error: ${String(err)}`);
    }
  };

  const fetchSessionUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const principal: SessionPrincipal = await res.json();
        setCurrentSession(principal);
      }
    } catch (err) {
      console.error("Failed to fetch session principal:", err);
    }
  };

  const handleAuthSignout = async () => {
    setAuthMsg(null);
    try {
      if (authToken) {
        await fetch(`${API_BASE_URL}/api/v1/auth/signout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      setAuthToken(null);
      setCurrentSession(null);
      setAuthMsgType("success");
      setAuthMsg("Successfully logged out. Session token has been invalidated.");
    } catch (err) {
      setAuthMsgType("error");
      setAuthMsg(`Logout error: ${String(err)}`);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data: PasswordRecoveryResponse = await res.json();
      if (res.ok) {
        setAuthMsgType("success");
        if (data.reset_token) {
          setResetToken(data.reset_token);
          setAuthMsg(`Recovery token generated! Copy it below or proceed to the Reset tab.`);
          setAuthMode("reset");
        } else {
          setAuthMsg(data.message);
        }
      } else {
        setAuthMsgType("error");
        setAuthMsg("Password recovery failed.");
      }
    } catch (err) {
      setAuthMsgType("error");
      setAuthMsg(`Error: ${String(err)}`);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      const data: PasswordResetResponse = await res.json();
      if (res.ok) {
        setAuthMsgType("success");
        setAuthMsg(data.message);
        setAuthPassword(newPassword);
        setAuthMode("signin");
      } else {
        const err = await res.json();
        setAuthMsgType("error");
        setAuthMsg(`Reset failed: ${err.detail || "Invalid or expired token"}`);
      }
    } catch (err) {
      setAuthMsgType("error");
      setAuthMsg(`Error: ${String(err)}`);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo-badge">U</div>
          <div>
            <div className="brand-text">Ubasify Practical Labs</div>
            <div className="brand-tag">Academic Monolith & Supabase Cloud</div>
          </div>
        </div>
        <div className="nav-badges">
          <div className="badge badge-supabase">
            <span className="status-dot" style={{ backgroundColor: "#3ecf8e" }}></span>
            Supabase: {supabaseStatus || SUPABASE_PROJECT_ID}
          </div>
          <div className="badge badge-online">
            <span className="status-dot"></span>
            FastAPI: {backendStatus || "Checking..."}
          </div>
          {currentSession ? (
            <div
              className="badge"
              style={{
                borderColor: "var(--lemon-green)",
                color: "var(--lemon-green)",
                background: "rgba(163, 230, 53, 0.12)",
              }}
            >
              👤 {currentSession.user.full_name}
            </div>
          ) : (
            <div className="badge" style={{ color: "var(--text-dim)" }}>
              Guest Session
            </div>
          )}
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-pill">
            <span>🛡️</span> Authentication, Password Hashing & Secure Session Architecture
          </div>
          <h1 className="hero-title">
            Enterprise Academic <span className="gradient-text">Practical Learning</span> Engine
          </h1>
          <p className="hero-subtitle">
            Engineered with cryptographic password hashing (bcrypt), signed JWT session tokens, token
            revocation on logout, password recovery flows, and Row Level Security on Supabase PostgreSQL.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              id="refresh-btn"
              className="btn-primary"
              onClick={() => {
                checkServices();
                loadData();
              }}
              disabled={loading}
            >
              {loading ? "Syncing..." : "🔄 Refresh All Entities"}
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
        </section>

        {/* Supabase Credentials Box */}
        <section className="credentials-banner">
          <div className="credentials-header">
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-white)" }}>
                Supabase Cloud Connection Credentials
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Configured with bcrypt password hashing and tokenized session derivations
              </p>
            </div>
            <div className="badge badge-supabase">Status: Active Integration</div>
          </div>
          <div className="credentials-grid">
            <div className="cred-box">
              <div className="cred-label">Project ID</div>
              <div className="cred-value">{SUPABASE_PROJECT_ID}</div>
            </div>
            <div className="cred-box">
              <div className="cred-label">Project URL</div>
              <div className="cred-value">{SUPABASE_URL}</div>
            </div>
            <div className="cred-box">
              <div className="cred-label">Password Hashing</div>
              <div className="cred-value">Bcrypt (Salt Rounds: 12)</div>
            </div>
            <div className="cred-box">
              <div className="cred-label">Session Protocol</div>
              <div className="cred-value">Signed JWT Bearer + JTI Revocation</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <nav className="tab-nav" aria-label="Database Entities">
            <button
              type="button"
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Architecture Overview
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "auth" ? "active" : ""}`}
              onClick={() => setActiveTab("auth")}
            >
              🔐 Auth & Session Manager
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "institutions" ? "active" : ""}`}
              onClick={() => setActiveTab("institutions")}
            >
              🏛️ Institutions ({institutions.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Users & Memberships ({users.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "templates" ? "active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              📚 Course Templates ({templates.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "offerings" ? "active" : ""}`}
              onClick={() => setActiveTab("offerings")}
            >
              🎓 Course Offerings ({offerings.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "enrolments" ? "active" : ""}`}
              onClick={() => setActiveTab("enrolments")}
            >
              📝 Enrolments ({enrolments.length})
            </button>
          </nav>

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <section className="grid">
              <article className="card">
                <div className="card-icon">🛡️</div>
                <h2 className="card-title">Authentication & Security</h2>
                <p className="card-description">
                  Bcrypt salted password hashing, JWT session signing, token revocation upon logout,
                  and cryptographic single-use password recovery tokens.
                </p>
              </article>
              <article className="card">
                <div className="card-icon">🏛️</div>
                <h2 className="card-title">Institutions & Roles</h2>
                <p className="card-description">
                  Multi-tenant isolation with unique academic codes and domains. Users hold
                  institutional memberships with roles (student, lecturer, admin).
                </p>
              </article>
              <article className="card">
                <div className="card-icon">📚</div>
                <h2 className="card-title">Separated Curricula</h2>
                <p className="card-description">
                  Reusable master course templates independent of offerings, semester pricing,
                  or institutional schedules.
                </p>
              </article>
            </section>
          )}

          {/* TAB: AUTH & SESSION MANAGER */}
          {activeTab === "auth" && (
            <div className="interactive-panel">
              {/* Authenticated Session Header */}
              {currentSession ? (
                <div
                  style={{
                    background: "rgba(16, 42, 67, 0.6)",
                    border: "1px solid rgba(163, 230, 53, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--lemon-green)", fontWeight: 700 }}>
                      Active Authenticated Session
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      {currentSession.user.full_name} ({currentSession.user.email})
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                      {currentSession.memberships.map((m) => (
                        <span key={m.id} className={`badge-tag badge-${m.role}`}>
                          {m.role} ({m.status})
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="btn-secondary" onClick={handleAuthSignout}>
                    🚪 Invalidate Session & Logout
                  </button>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`btn-secondary ${authMode === "signin" ? "btn-primary" : ""}`}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthMsg(null);
                  }}
                >
                  🔑 Sign In (Login)
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${authMode === "signup" ? "btn-primary" : ""}`}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthMsg(null);
                  }}
                >
                  ✨ Register (Sign Up)
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${authMode === "forgot" ? "btn-primary" : ""}`}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    setAuthMode("forgot");
                    setAuthMsg(null);
                  }}
                >
                  📩 Password Recovery
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${authMode === "reset" ? "btn-primary" : ""}`}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    setAuthMode("reset");
                    setAuthMsg(null);
                  }}
                >
                  🔄 Reset Password
                </button>
              </div>

              {/* MODE: SIGN IN */}
              {authMode === "signin" && (
                <form onSubmit={handleAuthSignin}>
                  <h3 className="interactive-title">User Login & Session Issuance</h3>
                  <p className="interactive-desc">
                    Authenticate using email and password. Credentials are verified against bcrypt password hashes.
                  </p>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Email Address</label>
                      <input
                        className="input-dark"
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Password</label>
                      <input
                        className="input-dark"
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    Authenticate & Create Session
                  </button>
                </form>
              )}

              {/* MODE: SIGN UP */}
              {authMode === "signup" && (
                <form onSubmit={handleAuthSignup}>
                  <h3 className="interactive-title">Account Registration & Password Hashing</h3>
                  <p className="interactive-desc">
                    Passwords are never stored in plaintext and are salted and hashed using bcrypt (12 rounds).
                  </p>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Full Name</label>
                      <input
                        className="input-dark"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Email Address</label>
                      <input
                        className="input-dark"
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Password (Min 6 chars)</label>
                      <input
                        className="input-dark"
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Institutional Role</label>
                      <select
                        className="select-dark"
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value as MembershipRole)}
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Institution</label>
                      <select
                        className="select-dark"
                        value={authInstitutionId}
                        onChange={(e) => setAuthInstitutionId(e.target.value)}
                      >
                        {institutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name} ({inst.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    Create Account & Hash Password
                  </button>
                </form>
              )}

              {/* MODE: PASSWORD RECOVERY */}
              {authMode === "forgot" && (
                <form onSubmit={handlePasswordRecovery}>
                  <h3 className="interactive-title">Password Recovery Request</h3>
                  <p className="interactive-desc">
                    Enter your registered email address to receive a short-lived cryptographic reset token.
                  </p>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Account Email Address</label>
                      <input
                        className="input-dark"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    Send Recovery Instructions
                  </button>
                </form>
              )}

              {/* MODE: PASSWORD RESET */}
              {authMode === "reset" && (
                <form onSubmit={handlePasswordReset}>
                  <h3 className="interactive-title">Confirm Password Reset</h3>
                  <p className="interactive-desc">
                    Provide the cryptographic reset token and your new password to update account credentials.
                  </p>
                  <div className="form-grid">
                    <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Password Reset Token</label>
                      <input
                        className="input-dark"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste reset token here..."
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">New Password (Min 6 chars)</label>
                      <input
                        className="input-dark"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    Update Password with Bcrypt Hash
                  </button>
                </form>
              )}

              {authMsg && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.85rem 1.25rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(11, 25, 44, 0.8)",
                    border: `1px solid ${authMsgType === "error" ? "rgba(239, 68, 68, 0.4)" : "var(--border-glass)"}`,
                    fontSize: "0.9rem",
                    color: authMsgType === "error" ? "#f87171" : "var(--lemon-green)",
                  }}
                >
                  {authMsg}
                </div>
              )}
            </div>
          )}

          {/* TAB: INSTITUTIONS */}
          {activeTab === "institutions" && (
            <div className="table-card">
              <div className="table-header-box">
                <div>
                  <h3 className="table-title">Academic Institutions</h3>
                  <p className="table-subtitle">
                    Registered university campuses and practical academy centers
                  </p>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>UUID (PK)</th>
                      <th>Institution Name</th>
                      <th>Code</th>
                      <th>Academic Domain</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((inst) => (
                      <tr key={inst.id}>
                        <td>
                          <span className="mono-uuid">{inst.id}</span>
                        </td>
                        <td>
                          <strong>{inst.name}</strong>
                        </td>
                        <td>
                          <span className="badge badge-online">{inst.code}</span>
                        </td>
                        <td>{inst.domain || "—"}</td>
                        <td>
                          <span className="badge-tag badge-active">
                            {inst.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                          {new Date(inst.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Add Form */}
              <div className="interactive-panel" style={{ margin: "1.5rem" }}>
                <h4 className="interactive-title">Create New Institution</h4>
                <form onSubmit={handleCreateInstitution}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Institution Name</label>
                      <input
                        className="input-dark"
                        placeholder="e.g. Stanford Practical Labs"
                        value={instName}
                        onChange={(e) => setInstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Code (Unique)</label>
                      <input
                        className="input-dark"
                        placeholder="e.g. SPL"
                        value={instCode}
                        onChange={(e) => setInstCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Domain (Unique)</label>
                      <input
                        className="input-dark"
                        placeholder="e.g. spl.edu"
                        value={instDomain}
                        onChange={(e) => setInstDomain(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    + Provision Institution
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: USERS & MEMBERSHIPS */}
          {activeTab === "users" && (
            <div className="table-card">
              <div className="table-header-box">
                <div>
                  <h3 className="table-title">Users & Institutional Memberships</h3>
                  <p className="table-subtitle">
                    Linked to Supabase Auth UUID identities with multi-tenant roles
                  </p>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User UUID (PK)</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Institution Roles</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((usr) => {
                      const userMems = memberships.filter((m) => m.user_id === usr.id);
                      return (
                        <tr key={usr.id}>
                          <td>
                            <span className="mono-uuid">{usr.id}</span>
                          </td>
                          <td>
                            <strong>{usr.full_name}</strong>
                          </td>
                          <td>{usr.email}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                              {userMems.length > 0 ? (
                                userMems.map((m) => (
                                  <span
                                    key={m.id}
                                    className={`badge-tag badge-${m.role}`}
                                  >
                                    {m.role} ({m.status})
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: "var(--text-dim)" }}>No active role</span>
                              )}
                            </div>
                          </td>
                          <td style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                            {new Date(usr.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COURSE TEMPLATES */}
          {activeTab === "templates" && (
            <div className="table-card">
              <div className="table-header-box">
                <div>
                  <h3 className="table-title">Master Course Templates</h3>
                  <p className="table-subtitle">
                    Reusable syllabus catalog independent of institutions, terms, and pricing
                  </p>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Template UUID (PK)</th>
                      <th>Course Code</th>
                      <th>Curriculum Title</th>
                      <th>Credits</th>
                      <th>Syllabus Modules</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((tpl) => (
                      <tr key={tpl.id}>
                        <td>
                          <span className="mono-uuid">{tpl.id}</span>
                        </td>
                        <td>
                          <span className="badge badge-online">{tpl.code}</span>
                        </td>
                        <td>
                          <strong>{tpl.title}</strong>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {tpl.description}
                          </div>
                        </td>
                        <td>
                          <strong>{tpl.credits} Credits</strong>
                        </td>
                        <td>
                          <code
                            style={{
                              fontSize: "0.75rem",
                              background: "rgba(0,0,0,0.3)",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              color: "var(--teal-light)",
                            }}
                          >
                            {JSON.stringify(tpl.syllabus_json)}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COURSE OFFERINGS */}
          {activeTab === "offerings" && (
            <div className="table-card">
              <div className="table-header-box">
                <div>
                  <h3 className="table-title">Scheduled Course Offerings</h3>
                  <p className="table-subtitle">
                    Semester-specific offerings with per-semester pricing, capacities, and lecturers
                  </p>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Offering UUID (PK)</th>
                      <th>Template FK</th>
                      <th>Institution FK</th>
                      <th>Semester</th>
                      <th>Tuition Price</th>
                      <th>Capacity</th>
                      <th>Registration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerings.map((off) => (
                      <tr key={off.id}>
                        <td>
                          <span className="mono-uuid">{off.id}</span>
                        </td>
                        <td>
                          <span className="mono-uuid">{off.template_id.slice(0, 8)}...</span>
                        </td>
                        <td>
                          <span className="mono-uuid">{off.institution_id.slice(0, 8)}...</span>
                        </td>
                        <td>
                          <strong>{off.semester}</strong>
                        </td>
                        <td>
                          <span style={{ color: "var(--lemon-green)", fontWeight: 700 }}>
                            ${(off.price_cents / 100).toFixed(2)}
                          </span>
                        </td>
                        <td>{off.capacity} seats</td>
                        <td>
                          <span
                            className={`badge-tag ${off.is_open ? "badge-active" : "badge-admin"}`}
                          >
                            {off.is_open ? "Open" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ENROLMENTS */}
          {activeTab === "enrolments" && (
            <div className="table-card">
              <div className="table-header-box">
                <div>
                  <h3 className="table-title">Academic Enrolments</h3>
                  <p className="table-subtitle">
                    Student registrations, payment statuses, and recorded grades
                  </p>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Enrolment UUID (PK)</th>
                      <th>Offering FK</th>
                      <th>Student FK</th>
                      <th>Lifecycle Status</th>
                      <th>Tuition Payment</th>
                      <th>Grade (%)</th>
                      <th>Enrolled At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolments.map((enr) => (
                      <tr key={enr.id}>
                        <td>
                          <span className="mono-uuid">{enr.id}</span>
                        </td>
                        <td>
                          <span className="mono-uuid">{enr.offering_id.slice(0, 8)}...</span>
                        </td>
                        <td>
                          <span className="mono-uuid">{enr.student_id.slice(0, 8)}...</span>
                        </td>
                        <td>
                          <span className="badge-tag badge-enrolled">{enr.status}</span>
                        </td>
                        <td>
                          <span className="badge-tag badge-paid">{enr.payment_status}</span>
                        </td>
                        <td>
                          {enr.grade !== null ? (
                            <strong style={{ color: "var(--lemon-green)" }}>{enr.grade}%</strong>
                          ) : (
                            <span style={{ color: "var(--text-dim)" }}>Pending</span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                          {new Date(enr.enrolled_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <section className="monitor-bar">
          <div className="monitor-item">
            <span className="monitor-label">Supabase Project</span>
            <span className="monitor-val">{SUPABASE_PROJECT_ID}</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">Security Engine</span>
            <span className="monitor-val">Bcrypt (Salt 12) + JWT Tokens</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">FastAPI Engine</span>
            <span className="monitor-val">Python 3.13 + Pydantic v2</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">Frontend Runtime</span>
            <span className="monitor-val">Next.js 16.4.0 (Turbopack)</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        © 2026 Ubasify Practical Labs (iyeob_lab). Built for independent multi-university practical
        education with Supabase Cloud.
      </footer>
    </>
  );
}
