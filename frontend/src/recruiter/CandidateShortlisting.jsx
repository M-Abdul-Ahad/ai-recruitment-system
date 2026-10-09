import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui";
import { MOCK_JOBS, MOCK_CANDIDATES, MOCK_UPLOADED_FILES } from "./mockShortlistingData";

export default function CandidateShortlisting() {
  const { jobId: routeJobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Selected Job (default to URL param or first job)
  const [selectedJobId, setSelectedJobId] = useState(() => {
    const parsed = parseInt(routeJobId, 10);
    return !isNaN(parsed) && MOCK_JOBS.some(j => j.id === parsed) ? parsed : MOCK_JOBS[0].id;
  });

  const selectedJob = useMemo(() => {
    return MOCK_JOBS.find(j => j.id === selectedJobId) || MOCK_JOBS[0];
  }, [selectedJobId]);

  // Candidates state (allows recruiter to toggle shortlisted status, etc.)
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [uploadedFiles, setUploadedFiles] = useState(MOCK_UPLOADED_FILES);

  // Filter & Search Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SHORTLISTED, APPLIED, INTERVIEW, REJECTED
  const [sourceFilter, setSourceFilter] = useState("ALL"); // ALL, DIRECT_APPLICANT, EXTERNAL_UPLOAD
  const [thresholdScore, setThresholdScore] = useState(70); // Cutoff slider (0-100)
  const [topXFilter, setTopXFilter] = useState("ALL"); // ALL, "3", "5", "10", "custom"
  const [customTopX, setCustomTopX] = useState(3);
  const [sortBy, setSortBy] = useState("score-desc"); // score-desc, score-asc, exp-desc, name-asc
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Simulation state for "Run AI Shortlisting Engine"
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Switch Job
  const handleJobChange = (newId) => {
    setSelectedJobId(newId);
    navigate(`/recruiter/shortlist/${newId}`);
    toast.info(`Switched to requisition: ${MOCK_JOBS.find(j => j.id === newId)?.title}`);
  };

  // Toggle Shortlist status for candidate
  const handleToggleShortlist = (candId) => {
    setCandidates(prev =>
      prev.map(c => {
        if (c.id === candId) {
          const nextStatus = c.status === "SHORTLISTED" ? "APPLIED" : "SHORTLISTED";
          toast.success(
            nextStatus === "SHORTLISTED"
              ? `${c.name} has been moved to Shortlisted!`
              : `${c.name} removed from Shortlist.`
          );
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Move candidate to interview
  const handleMoveToInterview = (candId) => {
    setCandidates(prev =>
      prev.map(c => {
        if (c.id === candId) {
          toast.success(`${c.name} moved to Interview stage!`);
          return { ...c, status: "INTERVIEW" };
        }
        return c;
      })
    );
  };

  // Auto-shortlist all above cutoff threshold
  const handleAutoShortlistAll = () => {
    const eligibleCount = candidates.filter(c => c.overallScore >= thresholdScore && c.status !== "SHORTLISTED").length;
    if (eligibleCount === 0) {
      toast.info(`All candidates scoring ≥ ${thresholdScore}% are already shortlisted.`);
      return;
    }
    setCandidates(prev =>
      prev.map(c => (c.overallScore >= thresholdScore ? { ...c, status: "SHORTLISTED" } : c))
    );
    toast.success(`Successfully auto-shortlisted ${eligibleCount} candidates scoring ≥ ${thresholdScore}%!`);
  };

  // Run AI Engine simulation
  const handleRunAiMatching = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 800);
    setTimeout(() => setAnalysisStep(3), 1600);
    setTimeout(() => {
      setAnalysisStep(4);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStep(0);
        toast.success("AI Shortlisting Engine completed! Candidate scores and rankings updated.");
      }, 700);
    }, 2400);
  };

  // Add dummy uploaded file
  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newEntries = files.map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      status: "Uploaded (Ready to analyze)",
      progress: 100,
    }));

    setUploadedFiles(prev => [...prev, ...newEntries]);
    toast.success(`Added ${files.length} resume file(s) to candidate pool.`);
    e.target.value = "";
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast.info("Resume file removed.");
  };

  // Shortlist Top X Candidates
  const handleShortlistTopX = () => {
    if (filteredCandidates.length === 0) {
      toast.info("No candidates match current criteria to shortlist.");
      return;
    }

    const count = filteredCandidates.length;
    const idsToShortlist = new Set(filteredCandidates.map(c => c.id));
    setCandidates(prev =>
      prev.map(c => (idsToShortlist.has(c.id) ? { ...c, status: "SHORTLISTED" } : c))
    );
    toast.success(`Successfully shortlisted the top ${count} candidate(s)!`);
  };

  // Filtered and Sorted Candidates
  const filteredCandidates = useMemo(() => {
    let list = candidates
      .filter(c => {
        // Search term
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.roleTitle.toLowerCase().includes(query) ||
          c.matchedSkills.some(s => s.toLowerCase().includes(query));

        // Status
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

        // Source
        const matchesSource = sourceFilter === "ALL" || c.source === sourceFilter;

        return matchesQuery && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        if (sortBy === "score-desc") return b.overallScore - a.overallScore;
        if (sortBy === "score-asc") return a.overallScore - b.overallScore;
        if (sortBy === "exp-desc") return b.experienceYears - a.experienceYears;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });

    // Apply Top X filter
    if (topXFilter !== "ALL") {
      const limit =
        topXFilter === "custom"
          ? Math.max(1, parseInt(customTopX, 10) || 1)
          : parseInt(topXFilter, 10);
      list = list.slice(0, limit);
    }

    return list;
  }, [candidates, searchTerm, statusFilter, sourceFilter, sortBy, topXFilter, customTopX]);

  // Statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlisted = candidates.filter(c => c.status === "SHORTLISTED").length;
    const qualified = candidates.filter(c => c.overallScore >= thresholdScore).length;
    const avgScore = total ? Math.round(candidates.reduce((acc, c) => acc + c.overallScore, 0) / total) : 0;
    return { total, shortlisted, qualified, avgScore };
  }, [candidates, thresholdScore]);

  return (
    <div className="apl-animate-fade max-w-7xl w-full min-w-0 mx-auto space-y-6 pb-12">
      {/* ── Breadcrumb & Top Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
        <Link
          to="/recruiter/jobs"
          className="text-xs font-bold text-[#8A8F76] dark:text-[#9CA485] hover:text-[#3D4127] dark:hover:text-[#D4DE95] transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs List
        </Link>

        {/* Job Requisition Switcher Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] uppercase font-extrabold text-[#8A8F76] dark:text-[#9CA485] tracking-wider whitespace-nowrap">
            Requisition:
          </span>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => handleJobChange(parseInt(e.target.value, 10))}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-extrabold bg-white dark:bg-[#222518] text-[#22241B] dark:text-[#EBF0DA] border border-[#D3D6C4] dark:border-[#383D28] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4DE95] cursor-pointer"
            >
              {MOCK_JOBS.map(job => (
                <option key={job.id} value={job.id} className="bg-white dark:bg-[#222518] text-[#22241B] dark:text-[#EBF0DA]">
                  Req #{job.id}: {job.title}
                </option>
              ))}
            </select>
            <svg
              className="w-3.5 h-3.5 text-[#8A8F76] dark:text-[#9CA485] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Page Title Row (Full Width, No Collision) ─────────────────────── */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
            AI Resume Shortlisting & Candidate Ranking
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D4DE95] text-[#3D4127] shadow-sm uppercase tracking-wider">
            <svg className="w-3.5 h-3.5 text-[#3D4127]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Gemini AI
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] max-w-3xl leading-relaxed">
          Screen, evaluate, and rank candidate resumes against requisition criteria with dual-layer hybrid matching.
        </p>
      </div>

      {/* ── Job Requisition Header Card ────────────────────────────────────── */}
      <div className="apl-card bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127] shadow-sm">
                Req #{selectedJob.id}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#3E7285]/15 text-[#3E7285] dark:text-[#7DD3FC] border border-[#3E7285]/30">
                {selectedJob.department}
              </span>
              <span className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedJob.location}
              </span>
              <span className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Min {selectedJob.experienceRequired} exp
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
                {selectedJob.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#52564A] dark:text-[#9CA485] mt-1 max-w-3xl leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            {/* Target Skills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-extrabold text-[#3D4127] dark:text-[#D4DE95] mr-1">Target Skills:</span>
              {selectedJob.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#D4DE95]/30 text-[#3D4127] dark:bg-[#D4DE95]/15 dark:text-[#D4DE95] border border-[#D4DE95]/40"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Action Button in Banner */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 self-stretch lg:self-center justify-center flex-shrink-0">
            <button
              onClick={handleRunAiMatching}
              disabled={isAnalyzing}
              className="apl-btn apl-btn-primary py-3 px-6 text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#3D4127]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running AI Matching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-[#3D4127] group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Run AI Shortlisting Engine
                </>
              )}
            </button>

            <button
              onClick={() => setShowUploadZone(prev => !prev)}
              className="apl-btn apl-btn-secondary py-2.5 px-5 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {showUploadZone ? "Hide Resume Ingestion" : "Upload External Resumes (PDF / ZIP)"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Outside Resume Ingestion & Upload Drawer (Collapsible) ───────────── */}
      {showUploadZone && (
        <div className="apl-card border-2 border-dashed border-[#D4DE95] dark:border-[#383D28] bg-[#F8F9F1]/80 dark:bg-[#171911]/90 p-6 space-y-4 rounded-2xl apl-animate-scale">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#3D4127] dark:text-[#D4DE95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Candidate Resume Ingestion
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Upload individual candidate resumes (PDF, DOCX) or a multi-candidate ZIP bundle from LinkedIn/Indeed.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]">
              {uploadedFiles.length} files currently loaded
            </span>
          </div>

          {/* Drag & drop dropzone */}
          <label className="border-2 border-dashed border-[#D3D6C4] dark:border-[#383D28] hover:border-[#D4DE95] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/60 dark:bg-[#222518]/60 transition-all text-center group">
            <div className="w-12 h-12 rounded-2xl bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">
              Click or drag candidate files here
            </span>
            <span className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-1">
              Supports .pdf, .docx, and .zip archives (up to 25MB each)
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.zip"
              onChange={handleAddFiles}
              className="hidden"
            />
          </label>

          {/* Files queue */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-[#52564A] dark:text-[#9CA485] uppercase tracking-wider block">
                Ingested Files Queue
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {uploadedFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#222518] flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#3D4127]/10 dark:bg-[#D4DE95]/10 text-[#3D4127] dark:text-[#D4DE95] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {file.name.endsWith(".zip") ? "ZIP" : "PDF"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[#8A8F76] dark:text-[#9CA485]">{file.size} • {file.status}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 rounded text-[#8A8F76] hover:text-[#B4453D] hover:bg-[#B4453D]/10 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── KPI Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="apl-card p-4 space-y-1 bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28]">
          <span className="text-[11px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
            Evaluated Pool
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
              {stats.total}
            </span>
            <span className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485]">Candidates</span>
          </div>
        </div>

        <div className="apl-card p-4 space-y-1 bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28] border-l-4 border-l-[#4E7A33]">
          <span className="text-[11px] font-bold text-[#4E7A33] dark:text-[#86EFAC] uppercase tracking-wider block">
            Qualified (≥{thresholdScore}%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#4E7A33] dark:text-[#86EFAC] apl-font-mono">
              {stats.qualified}
            </span>
            <span className="text-xs font-bold text-[#4E7A33] dark:text-[#86EFAC] bg-[#4E7A33]/15 px-2 py-0.5 rounded-full">
              {stats.total ? Math.round((stats.qualified / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="apl-card p-4 space-y-1 bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28] border-l-4 border-l-[#3D4127] dark:border-l-[#D4DE95]">
          <span className="text-[11px] font-bold text-[#3D4127] dark:text-[#D4DE95] uppercase tracking-wider block">
            Shortlisted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#3D4127] dark:text-[#D4DE95] apl-font-mono">
              {stats.shortlisted}
            </span>
            <span className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485]">Candidates</span>
          </div>
        </div>

        <div className="apl-card p-4 space-y-1 bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28]">
          <span className="text-[11px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
            Avg AI Match
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
              {stats.avgScore}%
            </span>
            <span className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485]">Cohort Mean</span>
          </div>
        </div>
      </div>

      {/* ── Controls & Filter Bar ──────────────────────────────────────────── */}
      <div className="apl-card space-y-4 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-[#8A8F76] absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, role, skill (e.g. React, Docker)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#F8F9F1] dark:bg-[#171911] text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E] focus:outline-none focus:ring-2 focus:ring-[#D4DE95]"
            />
          </div>

          {/* Threshold Cutoff Slider */}
          <div className="flex items-center gap-3 bg-[#F8F9F1] dark:bg-[#171911] px-4 py-2 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E]">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
                Cutoff Threshold
              </span>
              <span className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
                {thresholdScore}% Min
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="5"
              value={thresholdScore}
              onChange={(e) => setThresholdScore(parseInt(e.target.value, 10))}
              className="w-28 accent-[#4E7A33] cursor-pointer"
            />
          </div>

          {/* Quick Action: Auto-shortlist & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAutoShortlistAll}
              className="apl-btn apl-btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Auto-Shortlist (≥{thresholdScore}%)
            </button>

            {/* View switcher */}
            <div className="flex items-center rounded-xl border border-[#D3D6C4] dark:border-[#383D28] overflow-hidden p-0.5 bg-white dark:bg-[#222518]">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === "table"
                    ? "bg-[#D4DE95] text-[#3D4127]"
                    : "text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
                }`}
                title="Table view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === "cards"
                    ? "bg-[#D4DE95] text-[#3D4127]"
                    : "text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
                }`}
                title="Cards view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8A8F76] mr-1">Status:</span>
            {["ALL", "SHORTLISTED", "INTERVIEW", "APPLIED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127]"
                    : "bg-[#F8F9F1] dark:bg-[#171911] text-[#52564A] dark:text-[#9CA485] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E]"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Source dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#8A8F76]">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8F9F1] dark:bg-[#171911] text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E] focus:outline-none"
              >
                <option value="ALL">All Sources</option>
                <option value="DIRECT_APPLICANT">Direct Applicants</option>
                <option value="EXTERNAL_UPLOAD">External Resumes</option>
              </select>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#8A8F76]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8F9F1] dark:bg-[#171911] text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E] focus:outline-none"
              >
                <option value="score-desc">Highest AI Match</option>
                <option value="score-asc">Lowest AI Match</option>
                <option value="exp-desc">Experience (Highest)</option>
                <option value="name-asc">Candidate Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top X Applicants Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-[#3D4127] dark:text-[#D4DE95] flex items-center gap-1 mr-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Filter Top Applicants:
            </span>
            {[
              { label: "All Candidates", value: "ALL" },
              { label: "Top 3", value: "3" },
              { label: "Top 5", value: "5" },
              { label: "Top 10", value: "10" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTopXFilter(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  topXFilter === opt.value
                    ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127] shadow-xs"
                    : "bg-[#F8F9F1] dark:bg-[#171911] text-[#52564A] dark:text-[#9CA485] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] border border-[#ECEEDF] dark:border-[#2A2E1E]"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Custom Top N Input */}
            <div className="flex items-center gap-1.5 bg-[#F8F9F1] dark:bg-[#171911] px-2 py-0.5 rounded-full border border-[#ECEEDF] dark:border-[#2A2E1E]">
              <span className="text-[10px] font-bold text-[#8A8F76]">Top</span>
              <input
                type="number"
                min="1"
                max={candidates.length}
                value={customTopX}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomTopX(val || 1);
                  setTopXFilter("custom");
                }}
                className="w-10 text-center text-xs font-black bg-white dark:bg-[#222518] text-[#22241B] dark:text-[#EBF0DA] rounded border border-[#D3D6C4] dark:border-[#383D28] py-0.5"
              />
              <button
                onClick={() => setTopXFilter("custom")}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                  topXFilter === "custom"
                    ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127]"
                    : "text-[#8A8F76] hover:text-[#22241B]"
                }`}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Quick Action: Shortlist Top X Button */}
          {topXFilter !== "ALL" && (
            <button
              onClick={handleShortlistTopX}
              className="apl-btn apl-btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              One-Click Shortlist Top {filteredCandidates.length}
            </button>
          )}
        </div>
      </div>

      {/* Top X Active Banner */}
      {topXFilter !== "ALL" && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-xl bg-[#D4DE95]/25 dark:bg-[#D4DE95]/10 border border-[#D4DE95]/50 text-xs font-semibold text-[#3D4127] dark:text-[#D4DE95]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4E7A33] animate-pulse" />
            <span>
              Filtering: Showing <strong>Top {filteredCandidates.length}</strong> highest-matching applicants out of {candidates.length} total.
            </span>
          </div>
          <button
            onClick={() => setTopXFilter("ALL")}
            className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            Show All Applicants
          </button>
        </div>
      )}

      {/* ── AI Processing Simulation Modal / Banner ────────────────────────── */}
      {isAnalyzing && (
        <div className="apl-card bg-gradient-to-r from-[#D4DE95]/20 to-[#3D4127]/10 dark:from-[#D4DE95]/10 dark:to-[#171911] border-2 border-[#D4DE95] p-5 rounded-2xl apl-animate-scale">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3D4127] text-[#D4DE95] flex items-center justify-center font-bold flex-shrink-0">
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                AI Shortlisting Pipeline in Progress...
              </h4>
              <p className="text-xs text-[#52564A] dark:text-[#9CA485]">
                {analysisStep === 1 && "Step 1/3: Extracting candidate resumes, parsing contact info & work history..."}
                {analysisStep === 2 && "Step 2/3: Computing text-embedding-004 vectors & semantic cosine similarity..."}
                {analysisStep === 3 && "Step 3/3: Evaluating skill taxonomy overlap, experience duration, and ranking..."}
                {analysisStep === 4 && "Finalizing shortlisting leaderboard and generating explainability insights..."}
              </p>
              <div className="w-full bg-[#ECEEDF] dark:bg-[#2A2E1E] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#3D4127] dark:bg-[#D4DE95] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${analysisStep * 25}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Candidate Results: Table View or Cards View ─────────────────────── */}
      {filteredCandidates.length === 0 ? (
        <div className="apl-card py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] flex items-center justify-center mx-auto text-[#8A8F76]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">No candidates match filters</h3>
          <p className="text-xs text-[#8A8F76] max-w-sm mx-auto">
            Try adjusting your search query, lowering the cutoff threshold slider, or clearing the status filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
              setSourceFilter("ALL");
              setThresholdScore(50);
            }}
            className="apl-btn apl-btn-secondary py-2 px-4 text-xs mx-auto"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ───────────────────────────────────────────────────── */
        <div className="apl-card overflow-hidden p-0 border border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#222518] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9F1] dark:bg-[#171911] border-b border-[#ECEEDF] dark:border-[#2A2E1E] text-[11px] font-black uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
                  <th className="py-3.5 px-4 w-16">Rank</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4 text-center">AI Match Score</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Breakdown Pillars</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Matched Skills</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E] text-xs">
                {filteredCandidates.map((cand, idx) => {
                  const isTopRank = idx === 0;
                  const isSecondRank = idx === 1;
                  const isThirdRank = idx === 2;

                  const scoreColor =
                    cand.overallScore >= 85
                      ? "text-[#4E7A33] dark:text-[#86EFAC] bg-[#4E7A33]/15 dark:bg-[#4E7A33]/25 border-[#4E7A33]/30"
                      : cand.overallScore >= 70
                      ? "text-[#C99A3E] dark:text-[#FDE047] bg-[#C99A3E]/15 dark:bg-[#C99A3E]/25 border-[#C99A3E]/30"
                      : "text-[#B4453D] dark:text-[#FCA5A5] bg-[#B4453D]/15 dark:bg-[#B4453D]/25 border-[#B4453D]/30";

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-[#F8F9F1]/80 dark:hover:bg-[#1E2114] transition-colors group"
                    >
                      {/* Rank badge */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center">
                          {isTopRank ? (
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm">
                              1
                            </span>
                          ) : isSecondRank ? (
                            <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center text-xs shadow-sm">
                              2
                            </span>
                          ) : isThirdRank ? (
                            <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs shadow-sm">
                              3
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] font-bold flex items-center justify-center text-xs apl-font-mono">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Candidate info */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl ${cand.avatarBg} font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm`}
                          >
                            {cand.initials}
                          </div>
                          <div>
                            <Link
                              to={`/recruiter/candidate/${cand.id}`}
                              className="font-extrabold text-[#22241B] dark:text-[#EBF0DA] hover:underline flex items-center gap-1.5"
                            >
                              {cand.name}
                              <svg className="w-3.5 h-3.5 text-[#8A8F76] group-hover:text-[#3D4127] dark:group-hover:text-[#D4DE95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                            <p className="text-[11px] text-[#8A8F76] dark:text-[#9CA485] mt-0.5">
                              {cand.roleTitle} • {cand.experienceYears} yrs
                            </p>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-[#52564A] dark:text-[#9CA485]">
                              {cand.source === "EXTERNAL_UPLOAD" ? (
                                <span className="bg-[#3E7285]/10 text-[#3E7285] dark:text-[#7DD3FC] px-1.5 py-0.5 rounded border border-[#3E7285]/20 flex items-center gap-1">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  External Resume
                                </span>
                              ) : (
                                <span className="bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] px-1.5 py-0.5 rounded border border-[#D4DE95]/30 flex items-center gap-1">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Direct Portal
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* AI Match Score with gauge pill */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-3 py-1.5 rounded-xl font-black text-sm apl-font-mono border ${scoreColor} shadow-sm`}
                          >
                            {cand.overallScore}%
                          </span>
                          <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485] mt-1">
                            {cand.tier}
                          </span>
                        </div>
                      </td>

                      {/* Breakdown Mini Bars */}
                      <td className="py-4 px-4 align-middle hidden md:table-cell">
                        <div className="space-y-1.5 w-48">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485]">
                              <span>Semantic Fit</span>
                              <span className="apl-font-mono text-[#22241B] dark:text-[#EBF0DA]">{cand.subScores.semantic}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#4E7A33] dark:bg-[#86EFAC] rounded-full"
                                style={{ width: `${cand.subScores.semantic}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485]">
                              <span>Skills Match</span>
                              <span className="apl-font-mono text-[#22241B] dark:text-[#EBF0DA]">{cand.subScores.skills}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D4DE95] rounded-full"
                                style={{ width: `${cand.subScores.skills}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Matched skills */}
                      <td className="py-4 px-4 align-middle hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cand.matchedSkills.slice(0, 3).map((sk, sidx) => (
                            <span
                              key={sidx}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33] dark:text-[#86EFAC] border border-[#4E7A33]/25"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                          {cand.missingSkills.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B4453D]/15 text-[#B4453D] dark:text-[#FCA5A5] border border-[#B4453D]/25">
                              ✗ {cand.missingSkills[0]}
                            </span>
                          )}
                          {cand.matchedSkills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485]">
                              +{cand.matchedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status pill */}
                      <td className="py-4 px-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            cand.status === "SHORTLISTED"
                              ? "bg-[#4E7A33]/15 text-[#4E7A33] dark:text-[#86EFAC] border border-[#4E7A33]/30"
                              : cand.status === "INTERVIEW"
                              ? "bg-[#C99A3E]/15 text-[#C99A3E] dark:text-[#FDE047] border border-[#C99A3E]/30"
                              : cand.status === "REJECTED"
                              ? "bg-[#B4453D]/15 text-[#B4453D] dark:text-[#FCA5A5] border border-[#B4453D]/30"
                              : "bg-[#3E7285]/15 text-[#3E7285] dark:text-[#7DD3FC] border border-[#3E7285]/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cand.status === "SHORTLISTED"
                                ? "bg-[#4E7A33] dark:bg-[#86EFAC]"
                                : cand.status === "INTERVIEW"
                                ? "bg-[#C99A3E] dark:bg-[#FDE047]"
                                : cand.status === "REJECTED"
                                ? "bg-[#B4453D] dark:bg-[#FCA5A5]"
                                : "bg-[#3E7285] dark:bg-[#7DD3FC]"
                            }`}
                          />
                          {cand.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleShortlist(cand.id)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              cand.status === "SHORTLISTED"
                                ? "bg-[#4E7A33] text-white hover:bg-[#3d6028]"
                                : "bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] hover:bg-[#D4DE95] dark:hover:bg-[#D4DE95] dark:hover:text-[#3D4127]"
                            }`}
                            title={cand.status === "SHORTLISTED" ? "Shortlisted" : "Shortlist candidate"}
                          >
                            {cand.status === "SHORTLISTED" ? "Shortlisted ✓" : "+ Shortlist"}
                          </button>

                          <Link
                            to={`/recruiter/candidate/${cand.id}`}
                            className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#3D4127] dark:hover:text-[#D4DE95] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors"
                            title="View Full Evaluation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── CARDS VIEW ────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((cand, idx) => {
            const scoreColor =
              cand.overallScore >= 85
                ? "text-[#4E7A33] dark:text-[#86EFAC] border-[#4E7A33]/30"
                : cand.overallScore >= 70
                ? "text-[#C99A3E] dark:text-[#FDE047] border-[#C99A3E]/30"
                : "text-[#B4453D] dark:text-[#FCA5A5] border-[#B4453D]/30";

            return (
              <div
                key={cand.id}
                className="apl-card apl-card-hover flex flex-col justify-between space-y-4 border border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#222518] relative shadow-sm"
              >
                {/* Header: Rank + Avatar + Name + Score Dial */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${cand.avatarBg} font-black text-sm flex items-center justify-center shadow-sm`}
                      >
                        {cand.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] px-1.5 py-0.5 rounded apl-font-mono">
                            Rank #{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold text-[#8A8F76] dark:text-[#9CA485]">
                            {cand.source === "EXTERNAL_UPLOAD" ? "External" : "Direct"}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] mt-0.5 leading-snug">
                          {cand.name}
                        </h4>
                        <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">{cand.roleTitle}</p>
                      </div>
                    </div>

                    {/* Circular Score Badge */}
                    <div className="text-right">
                      <span className={`text-xl font-black apl-font-mono ${scoreColor} block`}>
                        {cand.overallScore}%
                      </span>
                      <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485]">Match</span>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  <p className="text-xs text-[#52564A] dark:text-[#9CA485] line-clamp-2 leading-relaxed bg-[#F8F9F1] dark:bg-[#171911] p-2.5 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] mb-3">
                    {cand.aiSummary}
                  </p>

                  {/* Skills Cloud */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#8A8F76]">
                      <span>Technical Competencies</span>
                      <span>{cand.experienceYears} yrs exp</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cand.matchedSkills.map((sk, sidx) => (
                        <span
                          key={sidx}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/10 text-[#4E7A33] border border-[#4E7A33]/20"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                      {cand.missingSkills.map((sk, sidx) => (
                        <span
                          key={sidx}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B4453D]/10 text-[#B4453D] border border-[#B4453D]/20"
                        >
                          ✗ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleShortlist(cand.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cand.status === "SHORTLISTED"
                        ? "bg-[#4E7A33] text-white"
                        : "bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] hover:bg-[#D4DE95]"
                    }`}
                  >
                    {cand.status === "SHORTLISTED" ? "Shortlisted ✓" : "+ Shortlist"}
                  </button>

                  <Link
                    to={`/recruiter/candidate/${cand.id}`}
                    className="apl-btn apl-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1"
                  >
                    Deep Dive
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}