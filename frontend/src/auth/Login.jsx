import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";
import { AuthContext } from "./AuthContext";

/* ── Inline icon helper ──────────────────────────────────────── */
const Icon = ({ d, size = 18, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const BrainIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("LOGIN REQUEST:", { email, password });
    try {
      await login({ email, password });
      console.log("REDIRECTING BASED ON ROLE");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <aside className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-orb auth-brand-orb-1" />
        <div className="auth-brand-orb auth-brand-orb-2" />

        <Link to="/" className="auth-brand-logo">
          <span className="auth-brand-logo-icon"><BrainIcon /></span>
          <span className="auth-brand-logo-name">NOMINATE <span>AI</span></span>
        </Link>

        <div className="auth-brand-content">
          <h1 className="auth-brand-headline">
            The Future of<br /><span>Intelligent Hiring</span>
          </h1>
          <p className="auth-brand-desc">
            Welcome back. Your AI-powered recruitment dashboard is waiting — with ranked candidates, live applications, and smart insights.
          </p>

          <ul className="auth-feature-list">
            {[
              "AI resume ranking & explainable scores",
              "Bulk parsing — any format, any scale",
              "One-click candidate shortlisting",
              "Full applicant tracking pipeline",
            ].map((f) => (
              <li key={f} className="auth-feature-item">
                <span className="auth-feature-check">
                  <Icon size={12} d={<polyline points="20 6 9 17 4 12" />} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-brand-footer">
          <p className="auth-brand-quote">
            "NOMINATE AI cut our time-to-hire from 6 weeks to under 2. The AI ranking is genuinely accurate."
          </p>
          <p className="auth-brand-quote-author">— Sarah Mitchell, Head of Talent at Nexora Tech</p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-form-panel">
        <div className="auth-form-wrap">

          {/* Mobile logo */}
          <Link to="/" className="auth-mobile-logo">
            <span className="auth-mobile-logo-icon"><BrainIcon /></span>
            <span className="auth-mobile-logo-name">NOMINATE <span>AI</span></span>
          </Link>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to continue to your dashboard.</p>
          </div>

          {error && (
            <div role="alert" style={{
              background: "var(--danger-bg)",
              border: "1px solid rgba(180, 69, 61, 0.25)",
              borderRadius: "var(--r-btn)",
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--danger)",
              marginBottom: "var(--sp-4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Icon size={16} d={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Icon size={16} d={<><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />
                </span>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw
                    ? <Icon size={16} d={<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></>} />
                    : <Icon size={16} d={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>} />
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? <><span className="auth-spinner" /><span>Signing in…</span></>
                : "Sign In"
              }
            </button>
          </form>

          <div className="auth-form-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-form-link">Create one free</Link>
          </div>

          <div style={{ marginTop: "var(--sp-5)", paddingTop: "var(--sp-5)", borderTop: "1px solid var(--n100)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--n500)", lineHeight: 1.6 }}>
              Are you a <strong style={{ color: "var(--n700)" }}>Recruiter?</strong> Your Company Owner will invite you by email.<br />
              No recruiter self-signup required.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
