import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

/* ── Inline SVG icons ── */
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const LogOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ── Route → page title map ── */
const PAGE_TITLES = {
  "/recruiter":             "Dashboard",
  "/recruiter/jobs":        "Manage Jobs",
  "/recruiter/jobs/create": "Create Job",
  "/recruiter/candidates":  "Candidate Management",
  "/recruiter/company":     "Company",
};

function getPageTitle(pathname) {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Pattern matches for dynamic segments
  if (pathname.startsWith("/recruiter/shortlist/")) return "Candidate Shortlisting";
  if (pathname.startsWith("/recruiter/candidate/")) return "Candidate Detail";
  return "Recruiter Portal";
}

export default function RecruiterHeader({ onToggleSidebar, isDark, onToggleTheme }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "RC";
  const displayName = user?.email ?? "Recruiter";
  const pageTitle = getPageTitle(location.pathname);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  const handleLogout = useCallback(() => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <header className="apl-header" role="banner">
      {/* Sidebar toggle */}
      <button
        id="rec-sidebar-toggle"
        className="apl-hdr-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <MenuIcon />
      </button>

      {/* Page title (desktop) */}
      <span className="apl-hdr-title" aria-current="page">
        {pageTitle}
      </span>

      <div className="apl-hdr-spacer" />

      {/* Search */}
      <div className="apl-hdr-search" role="search">
        <SearchIcon aria-hidden="true" />
        <input
          id="rec-header-search"
          className="apl-hdr-search-input"
          type="search"
          placeholder="Search jobs, candidates..."
          aria-label="Search"
        />
      </div>

      <div className="apl-hdr-actions">
        {/* Notifications */}
        <button
          id="rec-notifications-btn"
          className="apl-hdr-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <BellIcon />
          <span className="apl-badge" aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          id="rec-theme-toggle"
          className="apl-hdr-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            id="rec-profile-btn"
            className="apl-hdr-profile"
            onClick={() => setProfileOpen((p) => !p)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            <div className="apl-hdr-profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <span className="apl-hdr-profile-name">{displayName}</span>
            <ChevronDown aria-hidden="true" />
          </button>

          {profileOpen && (
            <div
              className="apl-profile-dropdown"
              role="menu"
              aria-label="User menu"
            >
              {/* Dropdown header */}
              <div className="apl-dropdown-header">
                <div className="apl-dropdown-header-name">{displayName}</div>
                <div className="apl-dropdown-header-role">{user?.role ?? "recruiter"}</div>
              </div>

              {/* Logout */}
              <button
                id="rec-logout-btn"
                className="apl-dropdown-item apl-dropdown-danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOutIcon aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
