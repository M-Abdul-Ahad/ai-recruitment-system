import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getJobs, getJobDetail, getMyApplications } from "../api/jobs";
import JobCard from "./components/JobCard";
import ApplyModal from "./components/ApplyModal";
import PortalShell from "../components/PortalShell";

const applicantNav = [
    { label: "Overview", to: "/applicant", end: true },
    { label: "Resume Analysis", to: "/applicant/resume", end: true },
    { label: "Resume Builder", to: "/applicant/builder", end: true },
    { label: "Jobs", to: "/applicant/jobs", end: true },
    { label: "Applications", to: "/applicant/applications", end: true },
];

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
        <PortalShell
            user={user}
            onLogout={handleLogout}
            badge="Job Discovery"
            title="Browse recommended openings and find the strongest-fit positions."
            subtitle="Explore active roles, review requirements, and apply directly from the applicant workspace."
            titleClass="text-2xl md:text-3xl xl:text-4xl"
            navItems={applicantNav}
            stats={[
                { value: loading ? "--" : String(jobs.length).padStart(2, "0"), label: "Total active positions" },
                { value: loading ? "--" : String(filteredJobs.length).padStart(2, "0"), label: "Matching your search" },
                { value: String(appliedJobIds.size).padStart(2, "0"), label: "Already applied" },
                { value: searchTerm ? "Active" : "Idle", label: "Search filter status" },
            ]}
        >
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 md:p-6 lg:p-8">
                {/* Header with search */}
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
                            Active openings
                        </div>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2.2rem]">
                            Browse Jobs
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {loading ? "Loading positions…" : `${filteredJobs.length} active position${filteredJobs.length !== 1 ? "s" : ""} available`}
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="w-full md:w-80">
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search jobs, skills, company…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-black/20 pl-10 pr-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Loading skeleton ── */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 animate-pulse">
                                <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-3" />
                                <div className="h-4 bg-white/6 rounded-lg w-1/2 mb-5" />
                                <div className="flex gap-2 mb-4">
                                    <div className="h-7 bg-white/6 rounded-lg w-20" />
                                    <div className="h-7 bg-white/6 rounded-lg w-16" />
                                    <div className="h-7 bg-white/6 rounded-lg w-24" />
                                </div>
                                <div className="flex gap-1.5 mb-5">
                                    <div className="h-6 bg-white/6 rounded-lg w-14" />
                                    <div className="h-6 bg-white/6 rounded-lg w-16" />
                                    <div className="h-6 bg-white/6 rounded-lg w-12" />
                                </div>
                                <div className="pt-4 border-t border-white/8 flex gap-2">
                                    <div className="h-10 bg-white/6 rounded-xl flex-1" />
                                    <div className="h-10 bg-white/10 rounded-xl flex-1" />
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
                            onClick={fetchJobs}
                            className="mt-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {searchTerm ? "No matching jobs found" : "No jobs available right now"}
                        </h3>
                        <p className="text-sm text-slate-400 max-w-sm mx-auto">
                            {searchTerm
                                ? "Try adjusting your search terms or clearing the filter."
                                : "Check back later for new opportunities. We're always adding new positions!"}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 px-5 py-2 text-xs font-bold text-violet-200 bg-violet-500/10 border border-violet-400/20 rounded-xl hover:bg-violet-500/20 transition"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    /* ── Job grid ── */
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
            </div>

            {/* ────────────── JOB DETAIL DRAWER ────────────── */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDetail}>
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* drawer panel */}
                    <div
                        className="relative w-full max-w-xl bg-[#0f0e1f] border-l border-white/10 shadow-2xl overflow-y-auto animate-slide-in-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeDetail}
                            className="absolute top-4 right-4 z-10 p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 transition"
                        >
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {detailLoading ? (
                            <div className="p-8 space-y-6 animate-pulse">
                                <div className="h-6 bg-white/10 rounded-lg w-2/3" />
                                <div className="h-4 bg-white/6 rounded-lg w-1/3" />
                                <div className="h-px bg-white/10 my-6" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-white/6 rounded-lg" />
                                    <div className="h-4 bg-white/6 rounded-lg w-5/6" />
                                    <div className="h-4 bg-white/6 rounded-lg w-4/6" />
                                </div>
                            </div>
                        ) : detailData ? (
                            <div className="p-8">
                                {/* Gradient header accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-400" />

                                {/* Title */}
                                <div className="mb-6 mt-2">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-violet-200/70 mb-2">
                                        Job Details
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                                        {detailData.title}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {detailData.company_name || "Company"}
                                    </p>
                                </div>

                                {/* Meta grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-4 rounded-[20px] border border-white/10 bg-white/[0.04]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Location</p>
                                        <p className="text-sm font-bold text-slate-200">{detailData.location || "Remote"}</p>
                                    </div>
                                    <div className="p-4 rounded-[20px] border border-white/10 bg-white/[0.04]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Experience</p>
                                        <p className="text-sm font-bold text-slate-200">{detailData.experience_required}+ years</p>
                                    </div>
                                    <div className="p-4 rounded-[20px] border border-white/10 bg-white/[0.04]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Salary</p>
                                        <p className="text-sm font-bold text-emerald-400">
                                            {formatSalary(detailData.salary_min, detailData.salary_max)}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-[20px] border border-white/10 bg-white/[0.04]">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status</p>
                                        <p className="text-sm font-bold text-slate-200 capitalize">{detailData.status?.toLowerCase()}</p>
                                    </div>
                                </div>

                                {/* Skills */}
                                {detailData.skills_data?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {detailData.skills_data.map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/20"
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
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Job Description</h4>
                                        <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                            {detailData.description}
                                        </div>
                                    </div>
                                )}

                                {/* Apply CTA */}
                                <div className="pt-6 border-t border-white/10">
                                    {appliedJobIds.has(detailData.id) ? (
                                        <button
                                            disabled
                                            className="w-full py-3 text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2"
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
                                            className="w-full py-3 text-sm font-semibold text-slate-950 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 flex items-center justify-center gap-2"
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
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out forwards;
          }
        `
            }} />
        </PortalShell>
    );
};

export default Jobs;