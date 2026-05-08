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
   - Future-ready for AI match scores & recommendations
   ====================================================================== */

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      {/* ────────────── NAVIGATION ────────────── */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link to="/applicant" className="flex items-center gap-3 mr-6">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AI Careers</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link to="/applicant" className="text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  Dashboard
                </Link>
                <Link to="/applicant/jobs" className="text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  Jobs
                </Link>
                <Link to="/applicant/applications" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold transition-colors px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                  Applications
                </Link>
                <Link to="/applicant/resume" className="text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  Resume
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ────────────── MAIN CONTENT ────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Track the status of your job applications
          </p>
        </div>

        {/* ── Stats cards ── */}
        {!loading && !error && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white", bg: "bg-white dark:bg-slate-900", border: "border-gray-100 dark:border-slate-800" },
              { label: "Applied", value: stats.applied, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
              { label: "Shortlisted", value: stats.shortlisted, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
              { label: "Interview", value: stats.interview, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20" },
              { label: "Rejected", value: stats.rejected, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20" },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} ${s.border} border rounded-xl p-4 text-center transition-all hover:shadow-sm`}
              >
                <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mt-1">
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
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700"
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
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3 mb-3" />
                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/5" />
                  </div>
                  <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ── Error state ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-500/20 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error}</h3>
            <button
              onClick={fetchApplications}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No applications yet</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Start browsing jobs and apply to positions that match your skills and experience.
            </p>
            <Link
              to="/applicant/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Jobs
            </Link>
          </div>
        ) : filteredApplications.length === 0 ? (
          /* ── No filtered results ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-10 text-center">
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              No applications with <strong>{statusFilter.toLowerCase()}</strong> status.
            </p>
            <button
              onClick={() => setStatusFilter("ALL")}
              className="mt-3 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
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
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: icon */}
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Middle: info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {app.job_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {app.company_name || "Company"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied {formatDate(app.applied_at)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">
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
                  <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          style={{ width: `${app.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-indigo-600">{app.match_score}% match</span>
                    </div>
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ────────────── ANIMATIONS ────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
          }
        `
      }} />
    </div>
  );
};

export default Applications;