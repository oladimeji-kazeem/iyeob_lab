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

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
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

  // Auth form state
  const [authEmail, setAuthEmail] = useState("student@ubasify.edu");
  const [authPassword, setAuthPassword] = useState("Password123!");
  const [authName, setAuthName] = useState("Ada Lovelace");
  const [authMsg, setAuthMsg] = useState<string | null>(null);

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

  const handleAuthSignup = async () => {
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          full_name: authName,
          role: "student",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthMsg(`Signed up successfully! Token: ${data.access_token.slice(0, 16)}...`);
        await loadData();
      } else {
        setAuthMsg(`Error: ${data.detail || "Signup failed"}`);
      }
    } catch (err) {
      setAuthMsg(`Failed: ${String(err)}`);
    }
  };

  const handleAuthSignin = async () => {
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
        setAuthMsg(`Authenticated as ${data.user.full_name} (${data.user.email})`);
      } else {
        setAuthMsg(`Error: ${data.detail || "Authentication failed"}`);
      }
    } catch (err) {
      setAuthMsg(`Failed: ${String(err)}`);
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
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-pill">
            <span>⚡</span> Supabase PostgreSQL Database & Modular Architecture
          </div>
          <h1 className="hero-title">
            Enterprise Academic <span className="gradient-text">Practical Learning</span> Engine
          </h1>
          <p className="hero-subtitle">
            Seamlessly integrated with Supabase PostgreSQL. Featuring robust schema architecture:
            UUID primary keys, foreign key constraints, separated reusable course templates,
            per-semester offerings, institutional memberships, and student enrollments.
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
                Target database project configured in frontend and backend environments
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
              <div className="cred-label">Publishable Anon Key</div>
              <div className="cred-value">sb_publishable_CBQUculx...</div>
            </div>
            <div className="cred-box">
              <div className="cred-label">Database Engine</div>
              <div className="cred-value">PostgreSQL 15 (UUID-OSSP + PGCrypto)</div>
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
            <button
              type="button"
              className={`tab-btn ${activeTab === "auth" ? "active" : ""}`}
              onClick={() => setActiveTab("auth")}
            >
              🔐 Auth Simulator
            </button>
          </nav>

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <section className="grid">
              <article className="card">
                <div className="card-icon">🏛️</div>
                <h2 className="card-title">Institutions & Access</h2>
                <p className="card-description">
                  Tenant boundaries with unique academic codes, domains, and multi-tenant isolation.
                  Users hold memberships with strict role scopes (student, lecturer, admin).
                </p>
              </article>
              <article className="card">
                <div className="card-icon">📚</div>
                <h2 className="card-title">Separated Course Templates</h2>
                <p className="card-description">
                  Reusable master curricula and academic credits independent of any institution or
                  semester term. Completely separated from offerings and pricing.
                </p>
              </article>
              <article className="card">
                <div className="card-icon">🎓</div>
                <h2 className="card-title">Offerings & Enrollments</h2>
                <p className="card-description">
                  Institutions schedule templates into specific terms (e.g. Fall 2026), attaching
                  per-semester pricing, capacities, and assigned lecturers with unique constraints.
                </p>
              </article>
            </section>
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

          {/* TAB: AUTH SIMULATOR */}
          {activeTab === "auth" && (
            <div className="interactive-panel">
              <h3 className="interactive-title">Supabase Authentication Simulator</h3>
              <p className="interactive-desc">
                Test user identity provisioning, JWT tokens, and institutional role assignment.
              </p>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    className="input-dark"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Email Address</label>
                  <input
                    className="input-dark"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Password</label>
                  <input
                    className="input-dark"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <button type="button" className="btn-primary" onClick={handleAuthSignup}>
                  Sign Up with Supabase
                </button>
                <button type="button" className="btn-secondary" onClick={handleAuthSignin}>
                  Sign In Session
                </button>
              </div>

              {authMsg && (
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(11, 25, 44, 0.8)",
                    border: "1px solid var(--border-glass)",
                    fontSize: "0.9rem",
                    color: authMsg.startsWith("Error") ? "#f87171" : "var(--lemon-green)",
                  }}
                >
                  {authMsg}
                </div>
              )}
            </div>
          )}
        </div>

        <section className="monitor-bar">
          <div className="monitor-item">
            <span className="monitor-label">Supabase Project</span>
            <span className="monitor-val">{SUPABASE_PROJECT_ID}</span>
          </div>
          <div className="monitor-item">
            <span className="monitor-label">Database Schema</span>
            <span className="monitor-val">UUID PKs, FKs, RLS, Triggers</span>
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
