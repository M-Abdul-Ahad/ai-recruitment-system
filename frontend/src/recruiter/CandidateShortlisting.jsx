import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getJobs,
  getApplicants,
  stageResumes,
  generateEmbeddings,
  getStagedResumes,
  shortlistCandidates,
} from "../api/jobs";
import ResumePreviewModal from "./components/ResumePreviewModal";

const TOTAL_GRID_SLOTS = 150; // GitHub-style matrix slot capacity

const CandidateShortlisting = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Job selection state
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Applicants & Staged resumes state
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [stagedCandidates, setStagedCandidates] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("shortlist_session_id") || "";
  });

  // Upload state
  const [activeTab, setActiveTab] = useState("applicants"); // 'applicants' | 'import'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isStaging, setIsStaging] = useState(false);
  const [stagingProgress, setStagingProgress] = useState(0);
  const [stageError, setStageError] = useState(null);

  // Embeddings generation state
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [embeddingsSuccess, setEmbeddingsSuccess] = useState(false);
  const [embeddingsMessage, setEmbeddingsMessage] = useState("");
  const [embeddingsError, setEmbeddingsError] = useState(null);

  // Subtask 5: Shortlisting Controls & Results State
  const [topN, setTopN] = useState(10);
  const [preferences, setPreferences] = useState("");
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [shortlistedResults, setShortlistedResults] = useState([]);
  const [shortlistSummary, setShortlistSummary] = useState(null);
  const [shortlistError, setShortlistError] = useState(null);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    name: "",
    text: "",
  });

  // Tooltip for matrix hover
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const resultsRef = useRef(null);

  // 1. Fetch Recruiter Jobs on Mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await getJobs();
      const jobList = res.data || [];
      setJobs(jobList);

      if (jobId) {
        const found = jobList.find((j) => String(j.id) === String(jobId));
        if (found) setSelectedJob(found);
        else if (jobList.length > 0) selectJob(jobList[0]);
      } else if (jobList.length > 0) {
        selectJob(jobList[0]);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const selectJob = (job) => {
    setSelectedJob(job);
    navigate(`/recruiter/shortlist/${job.id}`, { replace: true });
  };

  // 2. Fetch Job Applicants & Staged Candidates when Selected Job changes
  useEffect(() => {
    if (selectedJob?.id) {
      fetchApplicants(selectedJob.id);
      if (sessionId) {
        fetchStagedCandidates(selectedJob.id, sessionId);
      }
      setEmbeddingsSuccess(false);
      setEmbeddingsMessage("");
      setEmbeddingsError(null);
      setShortlistedResults([]);
      setShortlistSummary(null);
      setShortlistError(null);
    }
  }, [selectedJob?.id]);

  const fetchApplicants = async (id) => {
    setLoadingApplicants(true);
    try {
      const res = await getApplicants(id);
      setApplicants(res.data || []);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const fetchStagedCandidates = async (id, sid) => {
    try {
      const res = await getStagedResumes(id, sid);
      setStagedCandidates(res.data.candidates || []);
    } catch (err) {
      console.error("Failed to fetch staged candidates:", err);
    }
  };

  // 3. File Staging Handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const addFiles = (newFiles) => {
    const validExts = [".pdf", ".docx", ".zip"];
    const filtered = newFiles.filter((f) => {
      const name = f.name.toLowerCase();
      return validExts.some((ext) => name.endsWith(ext));
    });
    setSelectedFiles((prev) => [...prev, ...filtered]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const handleUploadAndStage = async () => {
    if (!selectedJob?.id || selectedFiles.length === 0) return;

    setIsStaging(true);
    setStagingProgress(0);
    setStageError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    if (sessionId) {
      formData.append("session_id", sessionId);
    }

    try {
      const res = await stageResumes(selectedJob.id, formData, (evt) => {
        const pct = Math.round((evt.loaded * 100) / evt.total);
        setStagingProgress(pct);
      });

      const newSid = res.data.session_id;
      setSessionId(newSid);
      localStorage.setItem("shortlist_session_id", newSid);

      setStagedCandidates(res.data.staged_candidates || []);
      setSelectedFiles([]);
      setActiveTab("import");
    } catch (err) {
      console.error("Staging error:", err);
      setStageError(err.response?.data?.error || "Failed to stage resumes. Please try again.");
    } finally {
      setIsStaging(false);
    }
  };

  // 4. Generate Embeddings Action
  const handleGenerateEmbeddings = async () => {
    if (!selectedJob?.id) return;

    setIsGeneratingEmbeddings(true);
    setEmbeddingsError(null);
    setEmbeddingsSuccess(false);

    try {
      const res = await generateEmbeddings(
        selectedJob.id,
        sessionId || "00000000-0000-0000-0000-000000000000"
      );
      setEmbeddingsSuccess(true);
      setEmbeddingsMessage(
        `Embeddings generated successfully! (${res.data.total_candidates_ready} candidate vector(s) ready for matching)`
      );
      // Refresh applicants and staged lists to show updated embedding status
      fetchApplicants(selectedJob.id);
      if (sessionId) fetchStagedCandidates(selectedJob.id, sessionId);
    } catch (err) {
      console.error("Generate embeddings error:", err);
      setEmbeddingsError(
        err.response?.data?.error ||
          "Failed to generate embeddings. Please check GEMINI_EMBEDDING_API_KEY."
      );
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  // 5. Run Shortlisting Action (Subtask 5)
  const handleRunShortlisting = async () => {
    if (!selectedJob?.id) return;

    setIsShortlisting(true);
    setShortlistError(null);

    try {
      const payload = {
        session_id: sessionId || null,
        top_n: Number(topN) || 10,
        preferences: preferences.trim(),
      };

      const res = await shortlistCandidates(selectedJob.id, payload);
      const results = res.data.candidates || [];
      setShortlistedResults(results);
      setShortlistSummary({
        shortlisted_count: res.data.shortlisted_count,
        total_screened: res.data.total_screened,
        preferences_applied: res.data.preferences_applied,
      });

      // Clear staged candidates since they were either promoted to R2 or purged
      setStagedCandidates([]);
      localStorage.removeItem("shortlist_session_id");
      setSessionId("");

      // Refresh job applicants to show newly promoted and shortlisted candidates
      fetchApplicants(selectedJob.id);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error("Shortlisting error:", err);
      setShortlistError(
        err.response?.data?.error ||
          "Failed to screen candidates. Please ensure embeddings have been generated first."
      );
    } finally {
      setIsShortlisting(false);
    }
  };

  // Preview Handler
  const handleOpenPreview = (candidate) => {
    const url = candidate.resume?.file || candidate.file_url || "";
    const name = candidate.applicant?.email || candidate.file_name || candidate.name || "Candidate Resume";
    const text = candidate.resume?.extracted_text || candidate.extracted_text || "";
    setPreviewModal({
      isOpen: true,
      url,
      name,
      text,
    });
  };

  // 6. Score Badge Formatter (DESIGN.md tokens)
  const getScoreBadge = (score) => {
    if (score >= 80) {
      return {
        label: "Strong match",
        colorClass: "bg-[#4E7A33]/15 text-[#4E7A33] border-[#4E7A33]/30",
        barColor: "bg-[#4E7A33]",
      };
    }
    if (score >= 50) {
      return {
        label: "Moderate match",
        colorClass: "bg-[#C99A3E]/15 text-[#C99A3E] border-[#C99A3E]/30",
        barColor: "bg-[#C99A3E]",
      };
    }
    return {
      label: "Weak match",
      colorClass: "bg-[#B4453D]/15 text-[#B4453D] border-[#B4453D]/30",
      barColor: "bg-[#B4453D]",
    };
  };

  // 7. GitHub-style Matrix Calculations
  const combinedCandidates = useMemo(() => {
    const list = [];
    applicants.forEach((app) => {
      const isShortlisted = app.status === "SHORTLISTED";
      list.push({
        id: `app-${app.id}`,
        name: app.applicant?.email || `Applicant #${app.id}`,
        type: "applicant",
        hasEmbedding: Boolean(app.resume?.embedding),
        status: app.status,
        isShortlisted,
        original: app,
      });
    });
    stagedCandidates.forEach((tc) => {
      list.push({
        id: `staged-${tc.id}`,
        name: tc.file_name,
        type: "staged",
        hasEmbedding: tc.has_embedding || Boolean(tc.embedding),
        status: "Staged Import",
        isShortlisted: false,
        original: tc,
      });
    });
    return list;
  }, [applicants, stagedCandidates]);

  const totalCandidateCount = combinedCandidates.length;
  const readyCandidateCount = combinedCandidates.filter((c) => c.hasEmbedding).length;

  return (
    <div className="apl-animate-fade max-w-7xl mx-auto space-y-6 pb-16">
      {/* ── Top Header & Job Selector ─────────────────────────────────── */}
      <div className="apl-card p-6 bg-gradient-to-r from-[#FFFFFF] via-[#F8F9F1] to-[#FFFFFF] dark:from-[#1F2316] dark:via-[#171911] dark:to-[#1F2316] border border-[#D3D6C4] dark:border-[#2A2E1E] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-[#636B2F] dark:text-[#BAC095] hover:underline inline-flex items-center gap-1.5 mb-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Job Requisitions
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
              AI Candidate Shortlisting Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-0.5">
              Dual-panel AI screening engine with pgvector embedding store and Cloudflare R2 promotion
            </p>
          </div>

          {/* Job Dropdown Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52564A] dark:text-[#BAC095] mb-1">
                Select Job Requisition
              </label>
              {loadingJobs ? (
                <div className="h-10 bg-[#ECEEDF] dark:bg-[#2A2E1E] animate-pulse rounded-lg" />
              ) : (
                <select
                  value={selectedJob?.id || ""}
                  onChange={(e) => {
                    const job = jobs.find((j) => String(j.id) === e.target.value);
                    if (job) selectJob(job);
                  }}
                  className="w-full text-xs font-bold bg-[#FFFFFF] dark:bg-[#1E2015] border-2 border-[#D3D6C4] dark:border-[#383D28] rounded-lg px-3 py-2 text-[#22241B] dark:text-[#EBF0DA] focus:border-[#636B2F] focus:outline-none transition-colors"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedJob && (
              <div className="pt-5 hidden sm:block">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    selectedJob.status === "ACTIVE"
                      ? "bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30"
                      : "bg-[#BAC095]/20 text-[#52564A] border border-[#BAC095]/40"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {selectedJob.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Dual-Panel Workspace ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT PANEL: Job Description & Criteria (Col 5)               */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-5">
          <div className="apl-card p-6 space-y-5 border border-[#D3D6C4] dark:border-[#2A2E1E]">
            <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold text-sm shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                    Job Description (JD)
                  </h2>
                  <p className="text-[11px] text-[#8A8F76]">Ground truth for semantic matching</p>
                </div>
              </div>

              {/* JD Vector Indicator */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold apl-font-mono ${
                  selectedJob?.jd_embedding
                    ? "bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30"
                    : "bg-[#C99A3E]/15 text-[#C99A3E] border border-[#C99A3E]/30"
                }`}
              >
                {selectedJob?.jd_embedding ? "✓ JD Vector (768d)" : "○ Pending Index"}
              </span>
            </div>

            {selectedJob ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA] leading-snug">
                    {selectedJob.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#52564A] dark:text-[#9CA485]">
                    <span className="font-semibold text-[#3D4127] dark:text-[#D4DE95]">
                      {selectedJob.company?.name || "Company"}
                    </span>
                    <span>•</span>
                    <span>{selectedJob.location || "Remote"}</span>
                    <span>•</span>
                    <span className="font-bold text-[#636B2F] dark:text-[#BAC095]">
                      {selectedJob.experience_required} yrs exp required
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {selectedJob.skills?.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8F76] mb-1.5">
                      Target Core Skills
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((skill) => (
                        <span
                          key={skill.id || skill.name}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4DE95]/25 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/50"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8F76] mb-1.5">
                    Requisition Overview
                  </label>
                  <div className="text-xs leading-relaxed text-[#52564A] dark:text-[#9CA485] bg-[#F8F9F1] dark:bg-[#171911] p-4 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] max-h-72 overflow-y-auto whitespace-pre-line">
                    {selectedJob.description}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#8A8F76]">No job selected.</div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: Resume Pool & GitHub-Style Grid (Col 7)          */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* ── Candidate Pool GitHub-Style Contribution Heatmap Matrix ── */}
          <div className="apl-card p-6 border border-[#D3D6C4] dark:border-[#2A2E1E] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-2">
                  <span>Candidate Pool Matrix</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] apl-font-mono">
                    {totalCandidateCount} / {TOTAL_GRID_SLOTS} slots
                  </span>
                </h3>
                <p className="text-[11px] text-[#8A8F76]">
                  GitHub-style square grid visualizer representing applicants and staged resumes
                </p>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-3 text-[11px] font-bold apl-font-mono">
                <span className="flex items-center gap-1.5 text-[#4E7A33]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#4E7A33]" /> {applicants.length} Applicants
                </span>
                <span className="flex items-center gap-1.5 text-[#3D4127] dark:text-[#D4DE95]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D4DE95]" /> {stagedCandidates.length} Staged
                </span>
              </div>
            </div>

            {/* Matrix Visualization */}
            <div className="bg-[#F8F9F1] dark:bg-[#151710] p-4 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] relative">
              <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 place-items-center">
                {Array.from({ length: TOTAL_GRID_SLOTS }).map((_, index) => {
                  const candidate = combinedCandidates[index];
                  const isFilled = Boolean(candidate);

                  let cellColor =
                    "bg-[#FFFFFF] dark:bg-[#202417] border border-[#D3D6C4]/60 dark:border-[#383D28]";
                  if (isFilled) {
                    if (candidate.isShortlisted) {
                      cellColor =
                        "bg-[#4E7A33] border-2 border-[#D4DE95] shadow-md ring-2 ring-[#D4DE95]/40 hover:scale-125 transition-transform cursor-pointer";
                    } else if (candidate.type === "applicant") {
                      cellColor = candidate.hasEmbedding
                        ? "bg-[#4E7A33] border border-[#3B5C26] shadow-sm hover:scale-125 transition-transform cursor-pointer"
                        : "bg-[#4E7A33]/50 border border-[#4E7A33] hover:scale-125 transition-transform cursor-pointer";
                    } else {
                      cellColor = candidate.hasEmbedding
                        ? "bg-[#D4DE95] border border-[#BAC095] shadow-sm hover:scale-125 transition-transform cursor-pointer"
                        : "bg-[#C99A3E] border border-[#9A742A] hover:scale-125 transition-transform cursor-pointer";
                    }
                  }

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => candidate && setHoveredSlot({ ...candidate, index })}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => candidate && handleOpenPreview(candidate.original)}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-[3px] ${cellColor}`}
                    />
                  );
                })}
              </div>

              {/* Tooltip Overlay */}
              {hoveredSlot && (
                <div className="absolute top-2 right-2 bg-[#22241B] text-[#FFFFFF] text-[11px] p-2.5 rounded-lg shadow-xl border border-[#3D4127] max-w-xs pointer-events-none z-10 animate-fade-in">
                  <div className="font-bold truncate">{hoveredSlot.name}</div>
                  <div className="text-[10px] text-[#BAC095] mt-0.5">
                    Type: <span className="capitalize">{hoveredSlot.type}</span> • Status:{" "}
                    {hoveredSlot.status}
                  </div>
                  <div className="text-[10px] mt-0.5 font-bold">
                    {hoveredSlot.hasEmbedding
                      ? "✓ Vector Embedding Ready"
                      : "○ Pending Embedding"}
                  </div>
                </div>
              )}

              {/* Grid Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E] text-[10px] font-semibold text-[#8A8F76]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#4E7A33]" />
                  <span>Applicant (Vector Ready)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#D4DE95]" />
                  <span>Imported Resume (Vector Ready)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#C99A3E]" />
                  <span>Pending Embedding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[2px] bg-[#FFFFFF] dark:bg-[#202417] border border-[#D3D6C4]/60" />
                  <span>Empty Slot ({TOTAL_GRID_SLOTS - totalCandidateCount} remaining)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ingestion Tabs & Bulk Upload Section ──────────────────── */}
          <div className="apl-card p-6 border border-[#D3D6C4] dark:border-[#2A2E1E] space-y-4">
            <div className="flex border-b border-[#ECEEDF] dark:border-[#2A2E1E]">
              <button
                onClick={() => setActiveTab("applicants")}
                className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                  activeTab === "applicants"
                    ? "text-[#3D4127] dark:text-[#D4DE95] border-b-2 border-[#3D4127] dark:border-[#D4DE95]"
                    : "text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
                }`}
              >
                Existing Applicants ({applicants.length})
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                  activeTab === "import"
                    ? "text-[#3D4127] dark:text-[#D4DE95] border-b-2 border-[#3D4127] dark:border-[#D4DE95]"
                    : "text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
                }`}
              >
                Import Bulk Resumes ({stagedCandidates.length} Staged)
              </button>
            </div>

            {/* TAB 1: Existing Applicants List */}
            {activeTab === "applicants" && (
              <div className="space-y-3">
                {loadingApplicants ? (
                  <div className="py-8 text-center text-xs text-[#8A8F76] animate-pulse">
                    Loading existing job applications...
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="py-8 text-center space-y-1">
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                      No applicant resumes in system for this job yet.
                    </p>
                    <p className="text-[11px] text-[#8A8F76]">
                      Switch to "Import Bulk Resumes" to add files or folders directly.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {applicants.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-lg border border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1]/60 dark:bg-[#171911]/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-md bg-[#4E7A33]/15 text-[#4E7A33] flex items-center justify-center font-bold">
                            {app.applicant?.email?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] block truncate">
                              {app.applicant?.email || `Applicant #${app.id}`}
                            </span>
                            <span className="text-[10px] text-[#8A8F76]">
                              {app.source_type} • Applied {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {app.status === "SHORTLISTED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33] text-white">
                              Shortlisted
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.resume?.embedding
                                ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                                : "bg-[#C99A3E]/15 text-[#C99A3E]"
                            }`}
                          >
                            {app.resume?.embedding ? "Vector Ready" : "Pending Embedding"}
                          </span>
                          <button
                            onClick={() => handleOpenPreview(app)}
                            className="text-[11px] font-bold text-[#636B2F] dark:text-[#BAC095] hover:underline"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Import Resumes (Drag-and-Drop, Files, Folders, ZIP) */}
            {activeTab === "import" && (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#636B2F] bg-[#D4DE95]/15 dark:bg-[#D4DE95]/5"
                      : "border-[#D3D6C4] dark:border-[#383D28] hover:border-[#636B2F] bg-[#F8F9F1]/40 dark:bg-[#171911]/40"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    multiple
                    accept=".pdf,.docx,.zip"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFileInputChange}
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                  />

                  <div className="w-10 h-10 mx-auto rounded-full bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    Drag & Drop candidate resumes or click to browse
                  </h4>
                  <p className="text-[11px] text-[#8A8F76] mt-0.5">
                    Supports individual <strong>PDF</strong> / <strong>DOCX</strong> files, <strong>ZIP archives</strong>, or complete folders
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="apl-btn apl-btn-secondary text-[11px] py-1 px-3"
                    >
                      Select Files / ZIP
                    </button>
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="apl-btn apl-btn-secondary text-[11px] py-1 px-3"
                    >
                      Select Folder
                    </button>
                  </div>
                </div>

                {/* Staging Error */}
                {stageError && (
                  <div className="text-xs p-3 bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] rounded-lg">
                    {stageError}
                  </div>
                )}

                {/* Selected Files Queue to Stage */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 p-3 bg-[#F8F9F1] dark:bg-[#171911] rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                      <span>{selectedFiles.length} file(s) queued for scratch staging:</span>
                      <button
                        onClick={clearSelectedFiles}
                        className="text-[11px] text-[#B4453D] hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                      {selectedFiles.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-[#202417] border border-[#ECEEDF] dark:border-[#2A2E1E]"
                        >
                          <span className="truncate pr-2 font-mono text-[11px] text-[#52564A] dark:text-[#BAC095]">
                            {f.name} ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                          <button
                            onClick={() => removeSelectedFile(i)}
                            className="text-[#8A8F76] hover:text-[#B4453D]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleUploadAndStage}
                        disabled={isStaging}
                        className="w-full apl-btn apl-btn-primary py-2 text-xs font-bold shadow-sm disabled:opacity-50"
                      >
                        {isStaging ? `Staging Resumes (${stagingProgress}%)...` : `Upload & Stage ${selectedFiles.length} Resume(s)`}
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Staged Candidates in Active Session */}
                {stagedCandidates.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#52564A] dark:text-[#BAC095]">
                      <span>Staged Candidates in Current Session:</span>
                      <span className="text-[10px] text-[#8A8F76] font-mono">
                        Session: {sessionId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {stagedCandidates.map((sc) => (
                        <div
                          key={sc.id}
                          className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#1A1C12] border border-[#ECEEDF] dark:border-[#2A2E1E] flex items-center justify-between text-xs"
                        >
                          <span className="truncate font-semibold text-[#22241B] dark:text-[#EBF0DA]">
                            {sc.file_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sc.has_embedding || sc.embedding
                                ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                                : "bg-[#C99A3E]/15 text-[#C99A3E]"
                            }`}
                          >
                            {sc.has_embedding || sc.embedding ? "Vector Ready" : "Awaiting Embed"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Action Trigger: Generate Embeddings Button ───────────── */}
          <div className="apl-card p-6 border-2 border-[#D4DE95] dark:border-[#383D28] bg-gradient-to-br from-[#FFFFFF] to-[#F8F9F1] dark:from-[#171911] dark:to-[#1A1D13] space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                  Generate Vectors & Embeddings
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Indexes the Job Description and all candidate resumes with Gemini (768 dimensions)
                </p>
              </div>

              <button
                onClick={handleGenerateEmbeddings}
                disabled={isGeneratingEmbeddings || totalCandidateCount === 0}
                className="apl-btn apl-btn-primary py-2.5 px-6 text-xs font-extrabold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
              >
                {isGeneratingEmbeddings ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Vectors...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Embeddings ({totalCandidateCount})
                  </>
                )}
              </button>
            </div>

            {/* Success message */}
            {embeddingsSuccess && (
              <div className="p-3 bg-[#4E7A33]/15 border border-[#4E7A33]/30 text-[#4E7A33] rounded-lg text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{embeddingsMessage}</span>
              </div>
            )}

            {/* Error message */}
            {embeddingsError && (
              <div className="p-3 bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] rounded-lg text-xs font-semibold">
                {embeddingsError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTASK 5: Shortlisting Controls & Screening Engine            */}
      {/* ============================================================== */}
      <div className="apl-card p-6 border-2 border-[#636B2F]/40 dark:border-[#383D28] bg-[#FFFFFF] dark:bg-[#1E2015] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#636B2F] animate-pulse" />
              <h2 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
                AI Shortlisting & Screening Controls
              </h2>
            </div>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-0.5">
              Specify how many candidates to shortlist and add optional custom hiring preferences
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/40 apl-font-mono">
              Ready Vectors: {readyCandidateCount} / {totalCandidateCount}
            </span>
          </div>
        </div>

        {/* Shortlisting Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Top N Selector */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4127] dark:text-[#EBF0DA]">
              Top Candidates to Shortlist (N)
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTopN(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    Number(topN) === num
                      ? "bg-[#3D4127] text-[#D4DE95] shadow-sm"
                      : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#BAC095] hover:bg-[#D4DE95]/30"
                  }`}
                >
                  Top {num}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="100"
                value={topN}
                onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2.5 py-1.5 text-xs font-extrabold apl-font-mono text-center rounded-lg border-2 border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#151710] text-[#22241B] dark:text-[#EBF0DA]"
              />
            </div>
            <p className="text-[11px] text-[#8A8F76]">
              Will rank all candidates and promote top {topN} to Cloudflare R2 and Job Requisition.
            </p>
          </div>

          {/* Preferences Textarea */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4127] dark:text-[#EBF0DA]">
                Custom Recruiter Preferences
              </label>
              <span className="text-[10px] font-semibold text-[#8A8F76] bg-[#ECEEDF] dark:bg-[#2A2E1E] px-2 py-0.5 rounded">
                Optional • 30% Weight
              </span>
            </div>
            <textarea
              rows={2}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Prefers candidates with 3+ years in Docker, FastAPI microservices, or AWS certifications..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] bg-[#F8F9F1] dark:bg-[#171911] text-[#22241B] dark:text-[#EBF0DA] placeholder-[#8A8F76] focus:border-[#636B2F] focus:outline-none transition-colors"
            />
          </div>

          {/* Run Shortlisting Button */}
          <div className="md:col-span-3">
            <button
              onClick={handleRunShortlisting}
              disabled={isShortlisting || totalCandidateCount === 0}
              className="w-full apl-btn apl-btn-primary py-3 text-xs font-extrabold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isShortlisting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Matching & Promoting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Shortlisting (Top {topN})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shortlisting Error */}
        {shortlistError && (
          <div className="p-3 bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] rounded-lg text-xs font-semibold">
            {shortlistError}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* RESULTS SECTION: Ranked Shortlisted Candidates                 */}
      {/* ============================================================== */}
      {shortlistedResults.length > 0 && (
        <div ref={resultsRef} className="apl-card p-6 border-2 border-[#4E7A33]/40 space-y-5 shadow-lg bg-white dark:bg-[#1A1D13]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#4E7A33] animate-pulse" />
                <h3 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
                  Shortlisted Candidates ({shortlistedResults.length})
                </h3>
              </div>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-0.5">
                Top {shortlistSummary?.shortlisted_count} ranked candidates out of {shortlistSummary?.total_screened} evaluated resumes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/recruiter/candidates"
                className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5"
              >
                <span>View in Candidate Management</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Candidate Ranked Cards List */}
          <div className="space-y-3">
            {shortlistedResults.map((candidate, idx) => {
              const rank = idx + 1;
              const badge = getScoreBadge(candidate.match_score);

              let rankBadgeStyle = "bg-[#ECEEDF] text-[#52564A] dark:bg-[#2A2E1E] dark:text-[#BAC095]";
              if (rank === 1) rankBadgeStyle = "bg-[#D4DE95] text-[#3D4127] font-black";
              else if (rank === 2) rankBadgeStyle = "bg-[#BAC095] text-[#3D4127] font-black";
              else if (rank === 3) rankBadgeStyle = "bg-[#636B2F] text-white font-black";

              return (
                <div
                  key={candidate.application_id || idx}
                  className="p-4 rounded-xl border border-[#D3D6C4] dark:border-[#2A2E1E] bg-[#F8F9F1]/40 dark:bg-[#151710]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#636B2F]"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-sm flex-shrink-0 apl-font-mono ${rankBadgeStyle}`}
                    >
                      #{rank}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
                          {candidate.name}
                        </h4>
                        {candidate.is_promoted_import && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/60 flex items-center gap-1">
                            <span>☁ R2 Promoted</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8A8F76] mt-0.5">
                        Status: <span className="font-bold text-[#4E7A33]">SHORTLISTED</span> • Source:{" "}
                        <span className="capitalize">{candidate.source_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                    {/* Score pill & visual bar */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border apl-font-mono ${badge.colorClass}`}>
                          {candidate.match_score}%
                        </span>
                        <span className="text-[11px] font-bold text-[#52564A] dark:text-[#BAC095] hidden md:inline">
                          {badge.label}
                        </span>
                      </div>
                      <div className="w-28 h-1.5 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] overflow-hidden ml-auto">
                        <div
                          className="h-full bg-[#D4DE95] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, candidate.match_score))}%` }}
                        />
                      </div>
                    </div>

                    {/* View Original Resume Button */}
                    <button
                      onClick={() => handleOpenPreview(candidate)}
                      className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Resume
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Resume Preview Modal ─────────────────────────────────────── */}
      <ResumePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, url: "", name: "", text: "" })}
        resumeUrl={previewModal.url}
        applicantName={previewModal.name}
        resumeText={previewModal.text}
      />
    </div>
  );
};

export default CandidateShortlisting;