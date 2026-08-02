import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="unauth-page">
      <div className="unauth-card">
        {/* Icon */}
        <div className="unauth-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--danger)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Big "403" */}
        <div className="unauth-code" aria-hidden="true">403</div>

        <h1 className="unauth-title">Access Denied</h1>
        <p className="unauth-desc">
          You don't have permission to view this page. This area may be restricted to a specific role, or your session may have expired.
        </p>

        <div className="unauth-actions">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Go Back
          </button>

          {user ? (
            <Link to="/" className="btn btn-primary">
              Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          )}
        </div>

        <div style={{ marginTop: "var(--sp-6)", paddingTop: "var(--sp-6)", borderTop: "1px solid var(--n100)" }}>
          <p style={{ fontSize: 12, color: "var(--n500)", lineHeight: 1.6 }}>
            If you believe this is an error, please contact your administrator or{" "}
            <a href="mailto:support@nominateai.com" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
              reach out to support
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
