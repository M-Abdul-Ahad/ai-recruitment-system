import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getJobs, getJobDetail, getMyApplications } from "../api/jobs";
import JobCard from "./components/JobCard";
import ApplyModal from "./components/ApplyModal";

/* ======================================================================
   APPLICANT JOBS PAGE
   - Fetches all ACTIVE jobs
   - Shows job cards with salary, skills, location, experience
   - Expandable detail drawer (right panel / modal)
   - Apply modal with resume picker
   - Duplicate application prevention
   ====================================================================== */

const Jobs = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    /* ── state ── */
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // Detail drawer / modal
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // Apply modal
    const [applyJob, setApplyJob] = useState(null);

    // Search / filter
    const [searchTerm, setSearchTerm] = useState("");

    /* ── initial data load ── */
    useEffect(() => {
        fetchJobs();
        fetchAppliedJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await getJobs();
            setJobs(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const res = await getMyApplications();
            const ids = new Set(res.data.map((app) => app.job));
            setAppliedJobIds(ids);
        } catch (err) {
            console.error("Failed to fetch applications:", err);
            // non-critical — don't block the page
        }
    };

    /* ── detail drawer ── */
    const handleViewDetails = useCallback(async (job) => {
        setSelectedJob(job);
        setDetailData(null);
        setDetailLoading(true);
        try {
            const res = await getJobDetail(job.id);
            setDetailData(res.data);
        } catch {
            setDetailData(job); // fallback to list data
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const closeDetail = useCallback(() => {
        setSelectedJob(null);
        setDetailData(null);
    }, []);

    /* ── apply flow ── */
    const handleApplyClick = useCallback((job) => {
        setApplyJob(job);
    }, []);

    const handleApplied = useCallback((jobId) => {
        setAppliedJobIds((prev) => new Set(prev).add(jobId));
    }, []);

    /* ── search filter ── */
    const filteredJobs = useMemo(() => {
        if (!searchTerm.trim()) return jobs;
        const q = searchTerm.toLowerCase();
        return jobs.filter(
            (j) =>
                j.title?.toLowerCase().includes(q) ||
                j.company_name?.toLowerCase().includes(q) ||
                j.location?.toLowerCase().includes(q) ||
                j.skills_data?.some((s) => s.name.toLowerCase().includes(q))
        );
    }, [jobs, searchTerm]);

    /* ── salary helper for detail ── */
    const formatSalary = (min, max) => {
        const fmt = (n) => {
            if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
            if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
            return `$${n?.toLocaleString()}`;
        };
        if (min && max) return `${fmt(min)} – ${fmt(max)}`;
        if (min) return `From ${fmt(min)}`;
        if (max) return `Up to ${fmt(max)}`;
        return "Not specified";
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
                                <Link to="/applicant/jobs" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold transition-colors px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                                    Jobs
                                </Link>
                                <Link to="/applicant/applications" className="text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Browse Jobs
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">
                            {loading ? "Loading..." : `${filteredJobs.length} active position${filteredJobs.length !== 1 ? "s" : ""} available`}
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="w-full sm:w-80">
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search jobs, skills, company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Loading skeleton ── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 animate-pulse">
                                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4 mb-3" />
                                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/2 mb-5" />
                                <div className="flex gap-2 mb-4">
                                    <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-20" />
                                    <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-16" />
                                    <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-24" />
                                </div>
                                <div className="flex gap-1.5 mb-5">
                                    <div className="h-6 bg-gray-100 dark:bg-slate-800 rounded-lg w-14" />
                                    <div className="h-6 bg-gray-100 dark:bg-slate-800 rounded-lg w-16" />
                                    <div className="h-6 bg-gray-100 dark:bg-slate-800 rounded-lg w-12" />
                                </div>
                                <div className="pt-4 border-t border-gray-50 dark:border-slate-800/50 flex gap-2">
                                    <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex-1" />
                                    <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl flex-1" />
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
                            onClick={fetchJobs}
                            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {searchTerm ? "No matching jobs found" : "No jobs available right now"}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                            {searchTerm
                                ? "Try adjusting your search terms or clearing the filter."
                                : "Check back later for new opportunities. We're always adding new positions!"}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 px-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    /* ── Job grid ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                isApplied={appliedJobIds.has(job.id)}
                                onViewDetails={handleViewDetails}
                                onApply={handleApplyClick}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ────────────── JOB DETAIL DRAWER ────────────── */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDetail}>
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                    {/* drawer panel */}
                    <div
                        className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto animate-slide-in-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeDetail}
                            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {detailLoading ? (
                            <div className="p-8 space-y-6 animate-pulse">
                                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3" />
                                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/3" />
                                <div className="h-px bg-gray-100 dark:bg-slate-800 my-6" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg" />
                                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-5/6" />
                                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-4/6" />
                                </div>
                            </div>
                        ) : detailData ? (
                            <div className="p-8">
                                {/* Gradient header accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

                                {/* Title */}
                                <div className="mb-6 mt-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">
                                        Job Details
                                    </p>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {detailData.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {detailData.company_name || "Company"}
                                    </p>
                                </div>

                                {/* Meta grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Location</p>
                                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{detailData.location || "Remote"}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Experience</p>
                                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{detailData.experience_required}+ years</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Salary</p>
                                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                            {formatSalary(detailData.salary_min, detailData.salary_max)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Status</p>
                                        <p className="text-sm font-bold text-gray-800 dark:text-slate-200 capitalize">{detailData.status?.toLowerCase()}</p>
                                    </div>
                                </div>

                                {/* Skills */}
                                {detailData.skills_data?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {detailData.skills_data.map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-500/20"
                                                >
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {detailData.description && (
                                    <div className="mb-8">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3">Job Description</h4>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {detailData.description}
                                        </div>
                                    </div>
                                )}

                                {/* Apply CTA */}
                                <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                                    {appliedJobIds.has(detailData.id) ? (
                                        <button
                                            disabled
                                            className="w-full py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Already Applied
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                closeDetail();
                                                handleApplyClick(detailData);
                                            }}
                                            className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Apply for this Position
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ────────────── APPLY MODAL ────────────── */}
            <ApplyModal
                isOpen={!!applyJob}
                onClose={() => setApplyJob(null)}
                job={applyJob}
                onApplied={handleApplied}
            />

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
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out forwards;
          }
        `
            }} />
        </div>
    );
};

export default Jobs;