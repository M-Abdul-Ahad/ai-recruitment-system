import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

/* ── Lucide-style inline SVG icons (no npm package needed) ── */
const Icon = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="8" y2="12"/>
    </svg>
  ),
  CheckSquare: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Nominate: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: "/applicant",              label: "Dashboard",       Icon: Icon.Grid,        exact: true  },
  { to: "/applicant/resume",       label: "Resume Analysis", Icon: Icon.FileText,    exact: false },
  { to: "/applicant/builder",      label: "Resume Builder",  Icon: Icon.Zap,         exact: false },
  { to: "/applicant/jobs",         label: "Browse Jobs",     Icon: Icon.Briefcase,   exact: false },
  { to: "/applicant/applications", label: "Applications",    Icon: Icon.CheckSquare, exact: false },
];

export default function ApplicantSidebar({ collapsed, mobileOpen }) {
  const { user } = useContext(AuthContext);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AP";

  const sidebarClass = [
    "apl-sidebar",
    collapsed           ? "apl-sb-collapsed"     : "",
    mobileOpen          ? "apl-sb-mobile-open"   : "",
  ].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass} aria-label="Main navigation">
      {/* Logo */}
      <a href="/applicant" className="apl-sb-logo" tabIndex={0}>
        <span className="apl-sb-logo-icon" aria-hidden="true">
          <Icon.Nominate />
        </span>
        <span className="apl-sb-logo-text">
          <span className="apl-sb-logo-name">Nominate AI</span>
          <span className="apl-sb-logo-sub">Applicant Portal</span>
        </span>
      </a>

      {/* Navigation */}
      <nav className="apl-sb-nav" aria-label="Applicant navigation">
        <span className="apl-sb-section-label">Menu</span>

        {NAV_ITEMS.map(({ to, label, Icon: NavIcon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            data-tooltip={label}
            className={({ isActive }) =>
              ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
            }
            aria-label={label}
          >
            <span className="apl-sb-link-icon" aria-hidden="true">
              <NavIcon />
            </span>
            <span className="apl-sb-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="apl-sb-footer">
        <div className="apl-sb-user">
          <div className="apl-sb-avatar" aria-hidden="true">{initials}</div>
          <div className="apl-sb-user-info">
            <div className="apl-sb-user-email" title={user?.email}>
              {user?.email ?? "—"}
            </div>
            <div className="apl-sb-user-role">{user?.role ?? "applicant"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
