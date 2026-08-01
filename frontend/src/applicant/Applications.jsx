import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications } from "../api/jobs";
import ApplicationStatusBadge from "./components/ApplicationStatusBadge";

/* ======================================================================
   APPLICANT APPLICATIONS PAGE
   - Fetches all applications for the logged-in applicant
   - Shows job title, company, status badge, applied date
   - Loading skeleton, empty state, error handling
   - Mossy Hollow design system compliant
   ====================================================================== */

const Applications = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ── state ── */
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ── initial load ── */
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      setApplications(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── filters ── */
  const statuses = ["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED"];

  const filteredApplications =
    statusFilter === "ALL"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  /* ── stats ── */
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  /* ── date format ── */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="apl-animate-fade space-y-8">
      {/* ────────────── HEADER BANNER ────────────── */}
      <div className="border-b border-[#D3D6C4] dark:border-[#383D28] pb-5">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
          Application Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
          My Applications
        </h1>
        <p className="text-xs sm:text-sm text-[#52564A] dark:text-[#9CA485] mt-1">
          Track real-time candidate pipeline updates, interview requests, and application statuses.
        </p>
      </div>

      {/* ────────────── STATS SUMMARY BAR ────────────── */}
      {!loading && !error && applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, badgeClass: "apl-pill-accent" },
            { label: "Applied", value: stats.applied, badgeClass: "apl-pill-info" },
            { label: "Shortlisted", value: stats.shortlisted, badgeClass: "apl-pill-success" },
            { label: "Interview", value: stats.interview, badgeClass: "apl-pill-warning" },
            { label: "Rejected", value: stats.rejected, badgeClass: "apl-pill-danger" },
          ].map((s) => (
            <div
              key={s.label}
              className="apl-card p-4 text-center space-y-1"
            >
              <p className="text-2xl font-extrabold apl-font-mono text-[#22241B] dark:text-[#EBF0DA]">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ────────────── STATUS FILTER TABS ────────────── */}
      {!loading && !error && applications.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statuses.map((s) => {
            const count = s === "ALL" ? applications.length : applications.filter((a) => a.status === s).length;
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`
                  px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-[#D4DE95] text-[#3D4127] shadow-sm"
                    : "bg-[#FFFFFF] dark:bg-[#222518] text-[#52564A] dark:text-[#9CA485] hover:bg-[#ECEEDF] border border-[#D3D6C4] dark:border-[#383D28]"
                  }
                `}
              >
                {s === "ALL" ? "All Applications" : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ────────────── LOADING SKELETON ────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="apl-card animate-pulse flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/3" />
                <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/4" />
              </div>
              <div className="h-7 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* ────────────── ERROR STATE ────────────── */
        <div className="apl-card text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#B4453D]/10 text-[#B4453D] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">{error}</h3>
          <button
            onClick={fetchApplications}
            className="apl-btn apl-btn-primary"
          >
            Retry Loading
          </button>
        </div>
      ) : applications.length === 0 ? (
        /* ────────────── EMPTY STATE ────────────── */
        <div className="apl-card text-center py-14 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#D4DE95] text-[#3D4127] flex items-center justify-center mx-auto text-xl font-bold">
            📌
          </div>
          <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">No applications submitted yet</h3>
          <p className="text-xs text-[#8A8F76] max-w-md mx-auto">
            Browse our open positions to submit your resume and track application progress in real-time.
          </p>
          <Link
            to="/applicant/jobs"
            className="apl-btn apl-btn-primary inline-flex"
          >
            Explore Active Jobs
          </Link>
        </div>
      ) : filteredApplications.length === 0 ? (
        /* ────────────── NO FILTER RESULTS ────────────── */
        <div className="apl-card text-center py-10 space-y-3">
          <p className="text-xs text-[#52564A] dark:text-[#9CA485]">
            No applications match the <strong>{statusFilter.toLowerCase()}</strong> status filter.
          </p>
          <button
            onClick={() => setStatusFilter("ALL")}
            className="apl-btn apl-btn-secondary text-xs"
          >
            View All Applications
          </button>
        </div>
      ) : (
        /* ────────────── APPLICATIONS LIST ────────────── */
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="apl-card apl-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  💼
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                    {app.job_title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#52564A] dark:text-[#9CA485]">
                    <span className="font-semibold text-[#636B2F] dark:text-[#D4DE95]">
                      🏢 {app.company_name || "Company"}
                    </span>
                    <span>•</span>
                    <span>Applied {formatDate(app.applied_at)}</span>
                    <span className="text-[#8A8F76]">({timeAgo(app.applied_at)})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <ApplicationStatusBadge status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;