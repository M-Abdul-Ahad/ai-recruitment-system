import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getJobs, getApplicants, updateApplicationDetails } from "../api/jobs";
import ApplicantCard from "./components/ApplicantCard";
import ResumePreviewModal from "./components/ResumePreviewModal";

const ITEMS_PER_PAGE = 9;

const CandidateManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link to="/recruiter" className="flex items-center gap-3 mr-6">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">AI Recruiter</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/recruiter" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link to="/recruiter/jobs" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">Jobs</Link>
                <Link to="/recruiter/candidates" className="text-blue-600 font-medium transition-colors border-b-2 border-blue-600 py-5">Candidates</Link>
                <Link to="/recruiter/company" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">Company</Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-500 mt-1">Review applicants, manage statuses, and preview resumes</p>
        </div>

        {/* Job Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Select Job</label>
          {jobsLoading ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ) : jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs found. <Link to="/recruiter/jobs/create" className="text-blue-600 font-medium">Create one</Link></p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedJobId === job.id
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {job.title}
                  <span className={`ml-1.5 text-xs ${selectedJobId === job.id ? "text-blue-200" : "text-gray-400"}`}>
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
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Status filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
                {["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                      statusFilter === s
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({statusCounts[s]})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Content */}
            {appLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                      <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                    </div>
                    <div className="h-6 bg-gray-100 rounded-lg w-24 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : appError ? (
              <div className="bg-white rounded-2xl border border-red-100 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{appError}</h3>
                <button onClick={() => fetchApplicants(selectedJobId)} className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition">Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {searchTerm || statusFilter !== "ALL" ? "No matching candidates" : "No applicants yet"}
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || statusFilter !== "ALL"
                    ? "Try adjusting your filters or search terms."
                    : `No one has applied to "${selectedJob?.title}" yet.`}
                </p>
                {(searchTerm || statusFilter !== "ALL") && (
                  <button onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }} className="mt-3 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition">Clear filters</button>
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
                      className="px-3 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                          currentPage === p ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={!!resumePreview}
        onClose={() => setResumePreview(null)}
        resumeUrl={resumePreview?.resume_file}
        applicantName={resumePreview?.applicant_name}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}} />
    </div>
  );
};

export default CandidateManagement;
