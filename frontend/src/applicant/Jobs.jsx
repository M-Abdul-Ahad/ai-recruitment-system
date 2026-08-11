import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { getJobs, getJobDetail, getMyApplications } from "../api/jobs";
import JobCard from "./components/JobCard";
import ApplyModal from "./components/ApplyModal";

/* ======================================================================
   APPLICANT JOBS PAGE
   - Fetches all ACTIVE jobs
   - Shows job cards with salary, skills, location, experience
   - Expandable detail drawer (right panel)
   - Apply modal with resume picker
   - Duplicate application prevention
   ====================================================================== */

const Jobs = () => {
  const { logout } = useContext(AuthContext);
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
      setDetailData(job);
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
    <div className="apl-animate-fade space-y-8">
      {/* ────────────── HEADER BANNER ────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D3D6C4] dark:border-[#383D28] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
            Career Opportunities
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
            Browse Jobs
          </h1>
          <p className="text-xs sm:text-sm text-[#52564A] dark:text-[#9CA485] mt-1">
            {loading ? "Discovering open positions..." : `${filteredJobs.length} active job${filteredJobs.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apl-input pl-10 pr-10 text-xs sm:text-sm"
            />
            <svg className="w-4 h-4 text-[#8A8F76] absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F76] hover:text-[#22241B] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ────────────── LOADING SKELETON ────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="apl-card animate-pulse space-y-4">
              <div className="h-5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-3/4" />
              <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-16" />
                <div className="h-6 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-20" />
              </div>
              <div className="pt-4 border-t border-[#ECEEDF] dark:border-[#2A2E1E] flex gap-2">
                <div className="h-9 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded flex-1" />
                <div className="h-9 bg-[#D4DE95]/50 rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* ────────────── ERROR STATE ────────────── */
        <div className="apl-card text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#B4453D]/10 text-[#B4453D] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">{error}</h3>
          <button
            onClick={fetchJobs}
            className="apl-btn apl-btn-primary"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* ────────────── EMPTY STATE ────────────── */
        <div className="apl-card text-center py-14 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#D4DE95] text-[#3D4127] flex items-center justify-center mx-auto text-xl font-bold">
            🔍
          </div>
          <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
            {searchTerm ? "No matching positions found" : "No active jobs right now"}
          </h3>
          <p className="text-xs text-[#8A8F76] max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search criteria or clearing filters to see all available roles."
              : "Check back soon for new career opportunities uploaded by recruiters."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="apl-btn apl-btn-secondary text-xs"
            >
              Clear Search Term
            </button>
          )}
        </div>
      ) : (
        /* ────────────── JOB GRID ────────────── */
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

      {/* ────────────── JOB DETAIL DRAWER ────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={closeDetail}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-[#22241B]/40 backdrop-blur-sm" />

          {/* drawer panel */}
          <div
            className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-[#222518] shadow-2xl border-l border-[#D3D6C4] dark:border-[#383D28] overflow-y-auto apl-animate-slide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeDetail}
              className="absolute top-5 right-5 z-10 p-2 rounded-lg bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] hover:text-[#22241B] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {detailLoading ? (
              <div className="p-8 space-y-6 animate-pulse">
                <div className="h-6 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-2/3" />
                <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/3" />
                <div className="h-px bg-[#ECEEDF] dark:bg-[#2A2E1E] my-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded" />
                  <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-5/6" />
                </div>
              </div>
            ) : detailData ? (
              <div className="p-8 space-y-6">
                {/* Header bar accent */}
                <div className="w-16 h-1.5 bg-[#D4DE95] rounded-full" />

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#636B2F] dark:text-[#D4DE95]">
                    Job Details & Scope
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
                    {detailData.title}
                  </h2>
                  <p className="text-sm font-semibold text-[#52564A] dark:text-[#9CA485] mt-1 flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>{detailData.company_name || "Company"}</span>
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76]">Location</p>
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] mt-0.5">{detailData.location || "Remote"}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76]">Experience</p>
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] mt-0.5">{detailData.experience_required ?? 0}+ years</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76]">Compensation</p>
                    <p className="text-xs font-bold text-[#4E7A33] dark:text-[#D4DE95] mt-0.5">
                      {formatSalary(detailData.salary_min, detailData.salary_max)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76]">Status</p>
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] capitalize mt-0.5">{detailData.status?.toLowerCase() || 'active'}</p>
                  </div>
                </div>

                {/* Skills Tags */}
                {detailData.skills_data?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] mb-3">Required Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailData.skills_data.map((s) => (
                        <span
                          key={s.id}
                          className="apl-pill apl-pill-accent text-xs"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                {detailData.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8A8F76]">Role Description</h4>
                    <div className="text-xs text-[#52564A] dark:text-[#9CA485] leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                      {detailData.description}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t border-[#D3D6C4] dark:border-[#383D28]">
                  {appliedJobIds.has(detailData.id) ? (
                    <button
                      disabled
                      className="w-full apl-btn apl-pill-success py-3 flex justify-center text-xs font-bold"
                    >
                      ✓ Already Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        closeDetail();
                        handleApplyClick(detailData);
                      }}
                      className="w-full apl-btn apl-btn-primary py-3 shadow-md"
                    >
                      Apply for this Role
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
    </div>
  );
};

export default Jobs;