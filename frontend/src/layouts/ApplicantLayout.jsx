import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import ApplicantHeader from "./ApplicantHeader";
import ApplicantSidebar from "./ApplicantSidebar";
import "./applicant-layout.css";

const THEME_KEY   = "apl-theme";
const SIDEBAR_KEY = "apl-sidebar-collapsed";

export default function ApplicantLayout() {
  /* ── Theme ─────────────────────────────────────────────────────── */
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  /* Sync theme attribute to <html> for CSS custom-property switching */
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-apl-theme",
      isDark ? "dark" : "light"
    );
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  /* ── Sidebar collapsed (desktop) ────────────────────────────────── */
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "true" : "false");
  }, [collapsed]);

  /* ── Mobile drawer ──────────────────────────────────────────────── */
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = () => window.innerWidth <= 768;

  const handleToggle = useCallback(() => {
    if (isMobile()) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  }, []);

  const handleBackdropClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /* Close mobile drawer on route change (Outlet navigates) */
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  /* Close mobile drawer on resize to desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const shellClass = [
    "apl-shell",
    collapsed && !isMobile() ? "apl-sb-collapsed-shell" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={shellClass} data-apl-theme={isDark ? "dark" : "light"}>
      {/* Mobile backdrop */}
      <div
        className={`apl-backdrop${mobileOpen ? " apl-visible" : ""}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <ApplicantSidebar collapsed={collapsed} mobileOpen={mobileOpen} />

      {/* Main area */}
      <div className="apl-main">
        {/* Header */}
        <ApplicantHeader
          onToggleSidebar={handleToggle}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
        />

        {/* Page content */}
        <div className="apl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
