import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

/* ── Inline SVG Icons (Lucide-style, matching existing sidebar pattern) ── */
const Icon = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9"/><path d="M16 21V9"/>
      <path d="M2 9h20"/><path d="M6 6h.01"/><path d="M18 6h.01"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  Logo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: "/admin",          label: "Dashboard",  Icon: Icon.Grid,      exact: true  },
  { to: "/admin/users",    label: "Users",      Icon: Icon.Users,     exact: false },
  { to: "/admin/roles",    label: "Roles",      Icon: Icon.Shield,    exact: false },
  { to: "/admin/companies",label: "Companies",  Icon: Icon.Building,  exact: false },
  { to: "/admin/jobs",     label: "Jobs",       Icon: Icon.Briefcase, exact: false },
];

export default function AdminSidebar({ collapsed, mobileOpen }) {
  const { user } = useContext(AuthContext);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  const sidebarClass = [
    "apl-sidebar",
    collapsed    ? "apl-sb-collapsed"   : "",
    mobileOpen   ? "apl-sb-mobile-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass} aria-label="Admin navigation">
      {/* Logo */}
      <a href="/admin" className="apl-sb-logo" tabIndex={0}>
        <span className="apl-sb-logo-icon" aria-hidden="true">
          <Icon.Logo />
        </span>
        <span className="apl-sb-logo-text">
          <span className="apl-sb-logo-name">Nominate AI</span>
          <span className="apl-sb-logo-sub">Admin Portal</span>
        </span>
      </a>

      {/* Navigation */}
      <nav className="apl-sb-nav" aria-label="Admin navigation">
        <span className="apl-sb-section-label">Admin</span>

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
            <div className="apl-sb-user-role">{user?.role ?? "admin"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
