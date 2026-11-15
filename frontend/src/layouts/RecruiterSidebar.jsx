import { NavLink, Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";

/* ── Lucide-style inline SVG icons ── */
const Icon = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Logo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  Upload: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Ranking: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Interview: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  Sliders: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  ChevronDown: ({ open }) => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.2s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

const SHORTLIST_SUB_ITEMS = [
  { tab: "upload",    label: "Resume Ingestion",       Icon: Icon.Upload },
  { tab: "shortlist", label: "AI Shortlisting",        Icon: Icon.Ranking },
  { tab: "interview", label: "Interview Question Kit", Icon: Icon.Interview },
  { tab: "config",    label: "Formula & Weights",      Icon: Icon.Sliders },
];

export default function RecruiterSidebar({ collapsed, mobileOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isShortlistActive = location.pathname.startsWith("/recruiter/shortlist");
  const [shortlistExpanded, setShortlistExpanded] = useState(true);

  // Auto-expand when navigating to shortlist section
  useEffect(() => {
    if (isShortlistActive) {
      setShortlistExpanded(true);
    }
  }, [isShortlistActive]);

  // Extract job ID if available in route e.g. /recruiter/shortlist/:jobId
  const jobMatch = location.pathname.match(/\/recruiter\/shortlist\/(\d+)/);
  const currentJobId = jobMatch ? jobMatch[1] : null;
  const baseShortlistPath = currentJobId ? `/recruiter/shortlist/${currentJobId}` : "/recruiter/shortlist";

  // Parse current active tab from query params
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "upload";

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "RC";

  const sidebarClass = [
    "apl-sidebar",
    collapsed  ? "apl-sb-collapsed"   : "",
    mobileOpen ? "apl-sb-mobile-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass} aria-label="Recruiter navigation">
      {/* Logo */}
      <Link to="/recruiter" className="apl-sb-logo" tabIndex={0}>
        <span className="apl-sb-logo-icon" aria-hidden="true">
          <Icon.Logo />
        </span>
        <span className="apl-sb-logo-text">
          <span className="apl-sb-logo-name">Nominate AI</span>
          <span className="apl-sb-logo-sub">Recruiter Portal</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="apl-sb-nav" aria-label="Recruiter navigation">
        <span className="apl-sb-section-label">Menu</span>

        {/* Dashboard */}
        <NavLink
          to="/recruiter"
          end={true}
          onClick={onClose}
          data-tooltip="Dashboard"
          className={({ isActive }) =>
            ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
          }
        >
          <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Grid /></span>
          <span className="apl-sb-link-label">Dashboard</span>
        </NavLink>

        {/* Jobs */}
        <NavLink
          to="/recruiter/jobs"
          onClick={onClose}
          data-tooltip="Jobs"
          className={({ isActive }) =>
            ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
          }
        >
          <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Briefcase /></span>
          <span className="apl-sb-link-label">Jobs</span>
        </NavLink>

        {/* Candidates */}
        <NavLink
          to="/recruiter/candidates"
          onClick={onClose}
          data-tooltip="Candidates"
          className={({ isActive }) =>
            ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
          }
        >
          <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Users /></span>
          <span className="apl-sb-link-label">Candidates</span>
        </NavLink>

        {/* AI Shortlisting (With Nested Workflow & Config Submenus) */}
        <div>
          <div className="flex items-center">
            <NavLink
              to={baseShortlistPath}
              onClick={onClose}
              data-tooltip="AI Shortlisting"
              className={["apl-sb-link flex-1", isShortlistActive ? "active" : ""].filter(Boolean).join(" ")}
              aria-label="AI Shortlisting"
            >
              <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Sparkles /></span>
              <span className="apl-sb-link-label">AI Shortlisting</span>
            </NavLink>

            {!collapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShortlistExpanded((prev) => !prev);
                }}
                className="p-2 mr-1 text-[#9CA87C] hover:text-[#D4DE95] hover:bg-[rgba(212,222,149,0.08)] rounded-md transition"
                aria-label="Toggle submenus"
                title="Toggle Shortlisting Submenus"
              >
                <Icon.ChevronDown open={shortlistExpanded} />
              </button>
            )}
          </div>

          {/* Submenu tabs */}
          {!collapsed && shortlistExpanded && (
            <div className="apl-sb-submenu">
              {SHORTLIST_SUB_ITEMS.map((sub) => {
                const subTo = `${baseShortlistPath}?tab=${sub.tab}`;
                const isSubActive = isShortlistActive && currentTab === sub.tab;
                const SubIcon = sub.Icon;

                return (
                  <Link
                    key={sub.tab}
                    to={subTo}
                    onClick={onClose}
                    className={["apl-sb-sublink", isSubActive ? "active" : ""].filter(Boolean).join(" ")}
                    title={sub.label}
                  >
                    <span className="apl-sb-sublink-icon" aria-hidden="true">
                      <SubIcon />
                    </span>
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Company */}
        <NavLink
          to="/recruiter/company"
          onClick={onClose}
          data-tooltip="Company"
          className={({ isActive }) =>
            ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
          }
        >
          <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Building /></span>
          <span className="apl-sb-link-label">Company</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/recruiter/settings"
          onClick={onClose}
          data-tooltip="Settings"
          className={({ isActive }) =>
            ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
          }
        >
          <span className="apl-sb-link-icon" aria-hidden="true"><Icon.Settings /></span>
          <span className="apl-sb-link-label">Settings</span>
        </NavLink>

        {user?.role === "company_admin" && (
          <>
            <span className="apl-sb-section-label" style={{ marginTop: "16px" }}>Company Admin</span>
            <NavLink
              to="/company"
              end={true}
              onClick={onClose}
              data-tooltip="Company Portal"
              className={({ isActive }) =>
                ["apl-sb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
              }
              aria-label="Company Management Portal"
            >
              <span className="apl-sb-link-icon" aria-hidden="true">
                <Icon.Building />
              </span>
              <span className="apl-sb-link-label">Company Portal</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="apl-sb-footer">
        <div className="apl-sb-user">
          <div className="apl-sb-avatar" aria-hidden="true">{initials}</div>
          <div className="apl-sb-user-info">
            <div className="apl-sb-user-email" title={user?.email}>
              {user?.email ?? "—"}
            </div>
            <div className="apl-sb-user-role">{user?.role ?? "recruiter"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}