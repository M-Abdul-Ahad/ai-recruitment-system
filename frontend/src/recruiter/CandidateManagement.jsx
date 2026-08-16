import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { getJobs, getApplicants, updateApplicationDetails } from "../api/jobs";
import ApplicantCard from "./components/ApplicantCard";
import ResumePreviewModal from "./components/ResumePreviewModal";

const ITEMS_PER_PAGE = 9;

const CandidateManagement = () => {
  const { user } = useContext(AuthContext);

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Applicants
  const [applicants, setApplicants] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Resume preview
  const [resumePreview, setResumePreview] = useState(null);

  // Load jobs on mount
  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await getJobs();
      const jobList = res.data;
      setJobs(jobList);
      if (jobList.length > 0) setSelectedJobId(jobList[0].id);
    } catch (err) { console.error(err); }
    finally { setJobsLoading(false); }
  };

  // Load applicants when selected job changes
  useEffect(() => {
    if (selectedJobId) fetchApplicants(selectedJobId);
  }, [selectedJobId]);

  const fetchApplicants = async (jobId) => {
    setAppLoading(true);
    setAppError(null);
    try {
      const res = await getApplicants(jobId);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
      setAppError("Failed to load applicants.");
    } finally { setAppLoading(false); }
  };

  // Status change
  const handleStatusChange = useCallback(async (appId, newStatus) => {
    setStatusUpdating(appId);
    try {
      const res = await updateApplicationDetails(selectedJobId, appId, { status: newStatus });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, ...res.data } : a));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update status.");
    } finally { setStatusUpdating(null); }
  }, [selectedJobId]);

  // Notes change
  const handleNotesChange = useCallback(async (appId, notes) => {
    try {
      await updateApplicationDetails(selectedJobId, appId, { recruiter_notes: notes });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, recruiter_notes: notes } : a));
    } catch (err) { console.error(err); }
  }, [selectedJobId]);

  // Filtering + search
  const filtered = useMemo(() => {
    let list = applicants;
    if (statusFilter !== "ALL") list = list.filter(a => a.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a =>
        (a.applicant_name || "").toLowerCase().includes(q) ||
        (a.applicant_email || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [applicants, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm, selectedJobId]);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const statusCounts = useMemo(() => ({
    ALL: applicants.length,
    APPLIED: applicants.filter(a => a.status === "APPLIED").length,
    SHORTLISTED: applicants.filter(a => a.status === "SHORTLISTED").length,
    INTERVIEW: applicants.filter(a => a.status === "INTERVIEW").length,
    REJECTED: applicants.filter(a => a.status === "REJECTED").length,
  }), [applicants]);

  return (
    <div className="apl-animate-fade space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">Candidate Management</h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">Review applicants, manage statuses, and preview candidate resumes</p>
      </div>

      {/* Job Selector Card */}
      <div className="apl-card">
        <label className="apl-label mb-2">Select Job Requisition</label>
        {jobsLoading ? (
          <div className="h-10 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-xl animate-pulse" />
        ) : jobs.length === 0 ? (
          <p className="text-xs sm:text-sm text-[#8A8F76]">No jobs found. <Link to="/recruiter/jobs/create" className="text-[#3D4127] dark:text-[#D4DE95] font-bold underline">Create one</Link></p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedJobId === job.id
                    ? "bg-[#D4DE95] text-[#3D4127] border-[#3D4127]/20 shadow-xs"
                    : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] border-[#D3D6C4] dark:border-[#383D28] hover:bg-[#D3D6C4]"
                }`}
              >
                {job.title}
                <span className={`ml-1.5 text-[11px] ${selectedJobId === job.id ? "text-[#3D4127]/80" : "text-[#8A8F76]"}`}>
                  ({job.status})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedJobId && (
        <>
          {/* Stats + Filters bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
              {["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all border ${
                    statusFilter === s
                      ? "bg-[#3D4127] text-[#D4DE95] border-[#3D4127] shadow-xs"
                      : "bg-white dark:bg-[#222518] text-[#52564A] dark:text-[#9CA485] border-[#D3D6C4] dark:border-[#383D28] hover:bg-[#ECEEDF]"
                  }`}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({statusCounts[s]})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="apl-input pl-10"
              />
            </div>
          </div>

          {/* Content */}
          {appLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="apl-card animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-xl" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-2/3" /><div className="h-3 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/2" /></div>
                  </div>
                  <div className="h-6 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-lg w-24" />
                  <div className="h-3 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-full" />
                </div>
              ))}
            </div>
          ) : appError ? (
            <div className="apl-card text-center p-12 border-[#B4453D]/20">
              <div className="w-16 h-16 rounded-full bg-[#B4453D]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#B4453D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA] mb-2">{appError}</h3>
              <button onClick={() => fetchApplicants(selectedJobId)} className="apl-btn apl-btn-primary py-2 px-5 text-xs">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="apl-card p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#D4DE95]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#3D4127] dark:text-[#D4DE95]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-1">
                {searchTerm || statusFilter !== "ALL" ? "No matching candidates" : "No applicants yet"}
              </h3>
              <p className="text-xs sm:text-sm text-[#8A8F76]">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your filters or search terms."
                  : `No one has applied to "${selectedJob?.title}" yet.`}
              </p>
              {(searchTerm || statusFilter !== "ALL") && (
                <button onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }} className="mt-4 apl-btn apl-btn-secondary text-xs py-2 px-4">Clear filters</button>
              )}
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map(app => (
                  <ApplicantCard
                    key={app.id}
                    applicant={app}
                    onStatusChange={handleStatusChange}
                    onNotesChange={handleNotesChange}
                    onViewResume={(a) => setResumePreview(a)}
                    statusUpdating={statusUpdating}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="apl-btn apl-btn-secondary py-2 px-3 text-xs disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                        currentPage === p ? "apl-btn-primary" : "apl-btn-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="apl-btn apl-btn-secondary py-2 px-3 text-xs disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={!!resumePreview}
        onClose={() => setResumePreview(null)}
        resumeUrl={resumePreview?.resume_file}
        applicantName={resumePreview?.applicant_name}
      />
    </div>
  );
};

export default CandidateManagement;
