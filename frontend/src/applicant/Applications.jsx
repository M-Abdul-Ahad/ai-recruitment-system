import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications } from "../api/jobs";
import ApplicationStatusBadge from "./components/ApplicationStatusBadge";
import PortalShell from "../components/PortalShell";

const applicantNav = [
  { label: "Overview", to: "/applicant", end: true },
  { label: "Resume Analysis", to: "/applicant/resume", end: true },
  { label: "Resume Builder", to: "/applicant/builder", end: true },
  { label: "Jobs", to: "/applicant/jobs", end: true },
  { label: "Applications", to: "/applicant/applications", end: true },
];

const Applications = () => {
  const { user, logout } = useContext(AuthContext);
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
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Applications Tracker"
      title="Monitor every application stage with clearer hiring status updates."
      subtitle="Track submissions, shortlists, interviews, and outcomes without leaving the applicant workspace."
      titleClass="text-2xl md:text-3xl xl:text-4xl"
      navItems={applicantNav}
      stats={[
        { value: loading ? "--" : String(stats.total).padStart(2, "0"), label: "Total applications" },
        { value: loading ? "--" : String(stats.shortlisted).padStart(2, "0"), label: "Shortlisted" },
        { value: loading ? "--" : String(stats.interview).padStart(2, "0"), label: "Interview stage" },
        { value: loading ? "--" : String(stats.applied).padStart(2, "0"), label: "Awaiting review" },
      ]}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
              Application history
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2.2rem]">
              My Applications
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Track the status of your job applications
            </p>
          </div>
          <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
            {loading ? "Loading…" : `${applications.length} total`}
          </div>
        </div>

        {/* ── Stats cards ── */}
        {!loading && !error && applications.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-5">
            {[
              { label: "Total", value: stats.total, dot: "bg-white/40" },
              { label: "Applied", value: stats.applied, dot: "bg-blue-400" },
              { label: "Shortlisted", value: stats.shortlisted, dot: "bg-amber-400" },
              { label: "Interview", value: stats.interview, dot: "bg-violet-400" },
              { label: "Rejected", value: stats.rejected, dot: "bg-red-400" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-center transition-all hover:border-violet-400/20 hover:bg-white/[0.06]"
              >
                <p className="text-2xl font-bold tracking-tight text-white">{s.value}</p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Status filter tabs ── */}
        {!loading && !error && applications.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {statuses.map((s) => {
              const count = s === "ALL" ? applications.length : applications.filter((a) => a.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`
                    px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all
                    ${statusFilter === s
                      ? "bg-gradient-to-r from-violet-500/25 to-cyan-400/20 text-white border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "text-slate-400 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded-lg w-1/3 mb-3" />
                    <div className="h-4 bg-white/6 rounded-lg w-1/4 mb-2" />
                    <div className="h-3 bg-white/6 rounded-lg w-1/5" />
                  </div>
                  <div className="h-7 bg-white/10 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ── Error state ── */
          <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
            <button
              onClick={fetchApplications}
              className="mt-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          /* ── Empty state ── */
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No applications yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              Start browsing jobs and apply to positions that match your skills and experience.
            </p>
            <Link
              to="/applicant/jobs"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Jobs
            </Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          /* ── No filtered results ── */
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-sm text-slate-400">
              No applications with <strong className="text-white">{statusFilter.toLowerCase()}</strong> status.
            </p>
            <button
              onClick={() => setStatusFilter("ALL")}
              className="mt-3 px-4 py-2 text-xs font-bold text-violet-200 bg-violet-500/10 border border-violet-400/20 rounded-xl hover:bg-violet-500/20 transition"
            >
              Show all
            </button>
          </div>
        ) : (
          /* ── Applications list ── */
          <div className="space-y-3">
            {filteredApplications.map((app, index) => (
              <div
                key={app.id}
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-[#151432]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: icon */}
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-indigo-500/10 items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Middle: info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-violet-200 transition-colors">
                      {app.job_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {app.company_name || "Company"}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied {formatDate(app.applied_at)}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({timeAgo(app.applied_at)})
                      </span>
                    </div>
                  </div>

                  {/* Right: status badge */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                </div>

                {/* AI Match Score placeholder — for future use */}
                {/* {app.match_score && (
                  <div className="mt-3 pt-3 border-t border-white/8">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                          style={{ width: `${app.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-violet-300">{app.match_score}% match</span>
                    </div>
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
};

export default Applications;