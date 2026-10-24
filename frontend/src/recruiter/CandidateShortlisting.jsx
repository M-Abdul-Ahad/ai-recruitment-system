import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getJobs,
  getApplicants,
  stageResumes,
  generateEmbeddings,
  getStagedResumes,
  shortlistCandidates,
  sendShortlistEmails,
  generateInterviewKit,
  getInterviewKit,
} from "../api/jobs";
import ResumePreviewModal from "./components/ResumePreviewModal";

const TOTAL_GRID_SLOTS = 150; // Candidate matrix visualizer capacity

const CandidateShortlisting = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Workflow Step: 'upload' | 'shortlist' | 'interview'
  const [currentWorkflowTab, setCurrentWorkflowTab] = useState("upload");

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

  // AI Profile Analysis (formerly Embeddings) state
  const [isAnalyzingProfiles, setIsAnalyzingProfiles] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisError, setAnalysisError] = useState(null);

  // Shortlisting Controls & Results State
  const [topN, setTopN] = useState(10);
  const [preferences, setPreferences] = useState("");
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [shortlistedResults, setShortlistedResults] = useState([]);
  const [shortlistSummary, setShortlistSummary] = useState(null);
  const [shortlistError, setShortlistError] = useState(null);

  // Email Selection & Sending State (Step 2)
  const [selectedCandidateIdsForEmail, setSelectedCandidateIdsForEmail] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [customEmailMessage, setCustomEmailMessage] = useState("");
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailNotification, setEmailNotification] = useState(null);

  // AI Interview Questions Kit State (Step 3)
  const [selectedInterviewCandidate, setSelectedInterviewCandidate] = useState(null);
  const [interviewDifficulty, setInterviewDifficulty] = useState("Mid-Level");
  const [interviewKits, setInterviewKits] = useState({}); // { [applicationId]: kitData }
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [generatingKitAppId, setGeneratingKitAppId] = useState(null);
  const [kitError, setKitError] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState(null);

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
        if (found) selectJob(found, false);
        else if (jobList.length > 0) selectJob(jobList[0], false);
      } else if (jobList.length > 0) {
        selectJob(jobList[0], false);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const selectJob = (job, shouldResetTab = true) => {
    setSelectedJob(job);
    navigate(`/recruiter/shortlist/${job.id}`, { replace: true });
    if (shouldResetTab) {
      setCurrentWorkflowTab("upload");
    }
  };

  // Case 1: Job Switching & In-Process Protection
  const handleJobSwitch = (newJobId) => {
    if (!newJobId || String(newJobId) === String(selectedJob?.id)) return;

    // Alert if process in progress
    if (isStaging || isAnalyzingProfiles || isShortlisting) {
      const confirmed = window.confirm(
        "An AI profile analysis or candidate shortlisting process is currently running for this job. Switching jobs will cancel the active operation. Are you sure you want to proceed?"
      );
      if (!confirmed) return;
    }

    const newJob = jobs.find((j) => String(j.id) === String(newJobId));
    if (!newJob) return;

    // Clear previous job transient state and session
    setSelectedFiles([]);
    setStagedCandidates([]);
    setSessionId("");
    localStorage.removeItem("shortlist_session_id");
    setStageError(null);
    setAnalysisSuccess(false);
    setAnalysisMessage("");
    setAnalysisError(null);
    setShortlistedResults([]);
    setShortlistSummary(null);
    setShortlistError(null);
    setSelectedInterviewCandidate(null);

    // Redirect to step 1 (upload)
    setCurrentWorkflowTab("upload");

    // Reset workflow tab to step 1 in sessionStorage for this switch
    try {
      const existingNewStateStr = sessionStorage.getItem(`ai_shortlist_state_${newJob.id}`);
      if (existingNewStateStr) {
        const existingNewState = JSON.parse(existingNewStateStr);
        existingNewState.currentWorkflowTab = "upload";
        sessionStorage.setItem(`ai_shortlist_state_${newJob.id}`, JSON.stringify(existingNewState));
      }
    } catch (e) {
      console.error("Error setting session state on job switch:", e);
    }

    selectJob(newJob, true);
  };

  // Case 2: Cross-Menu Navigation Persistence
  // Restore persisted state for selected job from sessionStorage
  useEffect(() => {
    if (selectedJob?.id) {
      const savedStateStr = sessionStorage.getItem(`ai_shortlist_state_${selectedJob.id}`);
      if (savedStateStr) {
        try {
          const saved = JSON.parse(savedStateStr);
          if (saved.currentWorkflowTab) setCurrentWorkflowTab(saved.currentWorkflowTab);
          if (saved.topN) setTopN(saved.topN);
          if (saved.preferences !== undefined) setPreferences(saved.preferences);
          if (saved.activeTab) setActiveTab(saved.activeTab);
        } catch (e) {
          console.error("Error restoring session state:", e);
        }
      }

      fetchApplicants(selectedJob.id);
      if (sessionId) {
        fetchStagedCandidates(selectedJob.id, sessionId);
      }
      setAnalysisSuccess(false);
      setAnalysisMessage("");
      setAnalysisError(null);
      setShortlistError(null);
    }
  }, [selectedJob?.id]);

  // Persist state updates to sessionStorage whenever user interacts
  useEffect(() => {
    if (selectedJob?.id) {
      const stateToSave = {
        currentWorkflowTab,
        topN,
        preferences,
        activeTab,
      };
      sessionStorage.setItem(`ai_shortlist_state_${selectedJob.id}`, JSON.stringify(stateToSave));
    }
  }, [selectedJob?.id, currentWorkflowTab, topN, preferences, activeTab]);

  // Case 3: Fetch Applicants & Automatically Retrieve Previous Shortlisted Resumes
  const fetchApplicants = async (id) => {
    setLoadingApplicants(true);
    try {
      const res = await getApplicants(id);
      const appList = res.data || [];
      setApplicants(appList);

      // Extract all previously shortlisted applications for this job
      const previouslyShortlisted = appList
        .filter((app) => app.status === "SHORTLISTED")
        .map((app) => ({
          application_id: app.id,
          name:
            app.applicant_name ||
            app.applicant?.email ||
            (app.resume?.file
              ? app.resume.file.split("/").pop().replace(/^[a-f0-9]{10}_/, "")
              : `Candidate #${app.id}`),
          email: app.applicant_email || app.email || null,
          match_score: app.match_score || 0,
          source_type: app.source_type,
          is_promoted_import: app.source_type === "RECRUITER_UPLOAD",
          resume: app.resume,
          file_url: app.resume?.file || "",
          extracted_text: app.resume?.extracted_text || "",
          has_interview_kit: Boolean(app.has_interview_kit),
          interview_kit_id: app.interview_kit_id || null,
          status: app.status,
        }))
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      if (previouslyShortlisted.length > 0) {
        setShortlistedResults(previouslyShortlisted);
        setShortlistSummary((prev) => prev || {
          shortlisted_count: previouslyShortlisted.length,
          total_screened: appList.length,
          preferences_applied: false,
        });
        setSelectedInterviewCandidate((prev) => prev || previouslyShortlisted[0]);
      }
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

  // 3. File & Folder Staging Handlers
  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Support dropping an entire directory / folder
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const fileList = [];
      const traverseEntry = async (entry) => {
        if (entry.isFile) {
          return new Promise((resolve) => {
            entry.file((file) => {
              fileList.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const entries = await new Promise((resolve) => {
            dirReader.readEntries(resolve);
          });
          for (const child of entries) {
            await traverseEntry(child);
          }
        }
      };

      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(traverseEntry(entry));
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        if (fileList.length > 0) {
          addFiles(fileList);
          return;
        }
      }
    }

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

  // Dedicated Folder Picker: Uses native showDirectoryPicker if available, with robust fallback
  const handleFolderSelect = async () => {
    if (window.showDirectoryPicker) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const files = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            files.push(file);
          }
        }
        if (files.length > 0) {
          addFiles(files);
        }
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return; // User canceled the picker dialog
        }
        console.warn("showDirectoryPicker error, falling back to input:", err);
      }
    }

    // Fallback: input with explicit webkitdirectory property
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
      folderInputRef.current.webkitdirectory = true;
      folderInputRef.current.click();
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

  // 4. Run AI Profile Analysis Action (formerly Generate Embeddings)
  const handleRunProfileAnalysis = async () => {
    if (!selectedJob?.id) return;

    setIsAnalyzingProfiles(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      const res = await generateEmbeddings(
        selectedJob.id,
        sessionId || "00000000-0000-0000-0000-000000000000"
      );
      setAnalysisSuccess(true);
      setAnalysisMessage(
        `AI Analysis complete! (${res.data.total_candidates_ready} candidate profile(s) ready for shortlisting)`
      );
      // Refresh applicants and staged lists to show updated profile status
      fetchApplicants(selectedJob.id);
      if (sessionId) fetchStagedCandidates(selectedJob.id, sessionId);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisError(
        err.response?.data?.error ||
          "Failed to analyze candidate profiles. Please try again."
      );
    } finally {
      setIsAnalyzingProfiles(false);
    }
  };

  // 5. Run Shortlisting Action
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

      // Auto-select first shortlisted candidate for questions tab
      if (results.length > 0) {
        setSelectedInterviewCandidate(results[0]);
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error("Shortlisting error:", err);
      setShortlistError(
        err.response?.data?.error ||
          "Failed to screen candidates. Please ensure resumes have been analyzed first."
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

  // 7. Matrix Calculations
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

  // 8. Email Shortlisted Candidates Handlers
  const toggleSelectCandidateForEmail = (appId) => {
    setSelectedCandidateIdsForEmail((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAllCandidatesForEmail = () => {
    if (selectedCandidateIdsForEmail.length === shortlistedResults.length) {
      setSelectedCandidateIdsForEmail([]);
    } else {
      setSelectedCandidateIdsForEmail(
        shortlistedResults.map((c) => c.application_id).filter(Boolean)
      );
    }
  };

  const handleSendShortlistEmails = async () => {
    if (!selectedJob?.id || selectedCandidateIdsForEmail.length === 0) return;
    setIsSendingEmails(true);
    setEmailNotification(null);
    try {
      const res = await sendShortlistEmails(
        selectedJob.id,
        selectedCandidateIdsForEmail,
        customEmailMessage
      );
      setEmailNotification({
        type: res.data.sent_count > 0 ? "success" : "warning",
        message: res.data.message || `Processed ${res.data.sent_count} emails successfully.`,
        sentCount: res.data.sent_count,
        failedCount: res.data.failed_count,
        results: res.data.results,
      });
      setIsEmailModalOpen(false);
      setCustomEmailMessage("");
      setSelectedCandidateIdsForEmail([]);
    } catch (err) {
      console.error("Failed to send shortlist emails:", err);
      setEmailNotification({
        type: "error",
        message:
          err.response?.data?.error ||
          "Failed to send shortlist emails. Please verify SMTP credentials in backend/.env.",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  // 9. AI Interview Questions Kit Handlers (Tab 3)
  // Auto-fetch interview kit from DB when candidate changes
  useEffect(() => {
    if (selectedJob?.id && selectedInterviewCandidate?.application_id) {
      const appId = selectedInterviewCandidate.application_id;
      if (!interviewKits[appId]) {
        getInterviewKit(selectedJob.id, appId)
          .then((res) => {
            if (res.data) {
              setInterviewKits((prev) => ({ ...prev, [appId]: res.data }));
              if (res.data.difficulty) {
                setInterviewDifficulty(res.data.difficulty);
              }
            }
          })
          .catch(() => {
            // Kit not yet generated for this candidate
          });
      }
    }
  }, [selectedJob?.id, selectedInterviewCandidate?.application_id]);

  const handleGenerateInterviewKit = async (targetDifficulty) => {
    if (!selectedJob?.id || !selectedInterviewCandidate?.application_id) return;
    const appId = selectedInterviewCandidate.application_id;
    const diff = targetDifficulty || interviewDifficulty;
    setIsGeneratingKit(true);
    setGeneratingKitAppId(appId);
    setKitError(null);
    try {
      const res = await generateInterviewKit(selectedJob.id, appId, diff);
      if (res.data) {
        setInterviewKits((prev) => ({ ...prev, [appId]: res.data }));
        setInterviewDifficulty(res.data.difficulty || diff);
        // Mark candidate as having an interview kit
        setShortlistedResults((prev) =>
          prev.map((c) =>
            c.application_id === appId ? { ...c, has_interview_kit: true } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to generate interview kit:", err);
      setKitError(
        err.response?.data?.error ||
          "Failed to generate interview questions with AI. Please check GEMINI_INTERVIEW_API_KEY in .env."
      );
    } finally {
      setIsGeneratingKit(false);
      setGeneratingKitAppId(null);
    }
  };

  const toggleAnswerAccordion = (qId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleCopyQuestion = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="apl-animate-fade max-w-7xl mx-auto space-y-6 pb-16">
      {/* ── Top Header Title ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            AI-powered candidate screening, automated shortlisting, and interview kit preparation
          </p>
        </div>

        {selectedJob && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1E2015] border border-[#D3D6C4] dark:border-[#2A2E1E] text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#4E7A33]" />
              <span className="text-[11px] text-[#8A8F76] font-medium">Requisition:</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">{selectedJob.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Workflow Stepper Navigation Tabs (ABOVE the Job Selection Div) ── */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E2015] border border-[#D3D6C4] dark:border-[#2A2E1E] rounded-2xl p-2 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5" role="tablist">
          {/* Step 1 Tab */}
          {(() => {
            const isStep1Done = (readyCandidateCount > 0 && totalCandidateCount > 0) || analysisSuccess;
            const isStep1Active = currentWorkflowTab === "upload";

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isStep1Active}
                onClick={() => setCurrentWorkflowTab("upload")}
                className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isStep1Active
                    ? "bg-gradient-to-r from-[#F8F9F1] to-[#FFFFFF] dark:from-[#282D1D] dark:to-[#1E2015] text-[#22241B] dark:text-[#EBF0DA] shadow-sm border border-[#BAC095]/70 dark:border-[#383D28]"
                    : "text-[#52564A] dark:text-[#9CA485] hover:bg-[#F8F9F1]/80 dark:hover:bg-[#171911]/80 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Step icon / indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform ${
                      isStep1Done
                        ? "bg-[#4E7A33] text-white ring-2 ring-[#4E7A33]/25"
                        : isStep1Active
                        ? "bg-[#3D4127] text-[#D4DE95] ring-2 ring-[#3D4127]/25"
                        : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]"
                    }`}
                  >
                    {isStep1Done ? "✓" : "1"}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold tracking-tight">
                        Resume Upload & Processing
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8F76] hidden sm:block">
                      Ingest files & AI profile analysis
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex-shrink-0 ml-2">
                  {isStep1Done ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
                      <span>✓ Completed</span>
                      <span className="font-mono">({readyCandidateCount})</span>
                    </span>
                  ) : isStep1Active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4DE95]/35 text-[#3D4127] dark:text-[#D4DE95]">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]">
                      Pending
                    </span>
                  )}
                </div>
              </button>
            );
          })()}

          {/* Stepper Divider Arrow */}
          <div className="hidden md:flex items-center text-[#BAC095]/70 text-xs px-1 select-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Step 2 Tab */}
          {(() => {
            const isStep2Done = shortlistedResults.length > 0;
            const isStep2Active = currentWorkflowTab === "shortlist";

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isStep2Active}
                onClick={() => setCurrentWorkflowTab("shortlist")}
                className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isStep2Active
                    ? "bg-gradient-to-r from-[#F8F9F1] to-[#FFFFFF] dark:from-[#282D1D] dark:to-[#1E2015] text-[#22241B] dark:text-[#EBF0DA] shadow-sm border border-[#BAC095]/70 dark:border-[#383D28]"
                    : "text-[#52564A] dark:text-[#9CA485] hover:bg-[#F8F9F1]/80 dark:hover:bg-[#171911]/80 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform ${
                      isStep2Done
                        ? "bg-[#4E7A33] text-white ring-2 ring-[#4E7A33]/25"
                        : isStep2Active
                        ? "bg-[#3D4127] text-[#D4DE95] ring-2 ring-[#3D4127]/25"
                        : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]"
                    }`}
                  >
                    {isStep2Done ? "✓" : "2"}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold tracking-tight">
                        AI Shortlisting & Ranking
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8F76] hidden sm:block">
                      Screen, score & rank candidates
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex-shrink-0 ml-2">
                  {isStep2Done ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
                      <span>✓ Completed</span>
                      <span className="font-mono">({shortlistedResults.length})</span>
                    </span>
                  ) : isStep2Active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4DE95]/35 text-[#3D4127] dark:text-[#D4DE95]">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]">
                      Step 02
                    </span>
                  )}
                </div>
              </button>
            );
          })()}

          {/* Stepper Divider Arrow */}
          <div className="hidden md:flex items-center text-[#BAC095]/70 text-xs px-1 select-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Step 3 Tab */}
          {(() => {
            const isStep3Ready = shortlistedResults.length > 0;
            const isStep3Active = currentWorkflowTab === "interview";

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isStep3Active}
                onClick={() => setCurrentWorkflowTab("interview")}
                className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isStep3Active
                    ? "bg-gradient-to-r from-[#F8F9F1] to-[#FFFFFF] dark:from-[#282D1D] dark:to-[#1E2015] text-[#22241B] dark:text-[#EBF0DA] shadow-sm border border-[#BAC095]/70 dark:border-[#383D28]"
                    : "text-[#52564A] dark:text-[#9CA485] hover:bg-[#F8F9F1]/80 dark:hover:bg-[#171911]/80 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform ${
                      isStep3Active
                        ? "bg-[#3D4127] text-[#D4DE95] ring-2 ring-[#3D4127]/25"
                        : isStep3Ready
                        ? "bg-[#D4DE95] text-[#3D4127]"
                        : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]"
                    }`}
                  >
                    3
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold tracking-tight">
                        Interview Question Kit
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8A8F76] hidden sm:block">
                      Resume-specific interview prep
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex-shrink-0 ml-2">
                  {isStep3Active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4DE95]/35 text-[#3D4127] dark:text-[#D4DE95]">
                      Active
                    </span>
                  ) : isStep3Ready ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
                      Ready
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]">
                      Step 03
                    </span>
                  )}
                </div>
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── Job Selection Div (SHOWN ONLY ON FIRST TAB: upload) ────────── */}
      {currentWorkflowTab === "upload" && (
        <div className="apl-card p-5 bg-gradient-to-r from-[#FFFFFF] via-[#F8F9F1] to-[#FFFFFF] dark:from-[#1F2316] dark:via-[#171911] dark:to-[#1F2316] border border-[#D3D6C4] dark:border-[#2A2E1E] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3D4127] text-[#D4DE95] apl-font-mono">
                Active Requisition
              </span>
              <h2 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] mt-1">
                {selectedJob?.title || "Choose a Job Requisition"}
              </h2>
              <p className="text-xs text-[#8A8F76] mt-0.5">
                Switch or choose the target job requisition to load its candidate pool and specifications
              </p>
            </div>

            {/* Job Dropdown Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-80">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52564A] dark:text-[#BAC095] mb-1">
                  Select Job Requisition
                </label>
                {loadingJobs ? (
                  <div className="h-10 bg-[#ECEEDF] dark:bg-[#2A2E1E] animate-pulse rounded-lg" />
                ) : (
                  <select
                    value={selectedJob?.id || ""}
                    onChange={(e) => handleJobSwitch(e.target.value)}
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
      )}

      {/* ================================================================ */}
      {/* TAB 1 CONTENT: RESUME UPLOAD & PROCESSING WORKSPACE             */}
      {/* ================================================================ */}
      {currentWorkflowTab === "upload" && (
        <div className="space-y-6 apl-animate-fade">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT PANEL: Job Description (Col 5) ── */}
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
                      <p className="text-[11px] text-[#8A8F76]">Ground truth for candidate evaluation</p>
                    </div>
                  </div>

                  {/* Job Profile Indicator */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold apl-font-mono ${
                      selectedJob?.jd_embedding
                        ? "bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30"
                        : "bg-[#C99A3E]/15 text-[#C99A3E] border border-[#C99A3E]/30"
                    }`}
                  >
                    {selectedJob?.jd_embedding ? "✓ Job Profile Ready" : "○ Pending Analysis"}
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

            {/* ── RIGHT PANEL: Candidate Pool Matrix & Bulk Upload (Col 7) ── */}
            <div className="lg:col-span-7 space-y-5">
              {/* Matrix Heatmap */}
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
                      Visual overview of applicant and staged resumes loaded into this job pool
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

                {/* Matrix Grid */}
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

                  {/* Tooltip */}
                  {hoveredSlot && (
                    <div className="absolute top-2 right-2 bg-[#22241B] text-[#FFFFFF] text-[11px] p-2.5 rounded-lg shadow-xl border border-[#3D4127] max-w-xs pointer-events-none z-10 animate-fade-in">
                      <div className="font-bold truncate">{hoveredSlot.name}</div>
                      <div className="text-[10px] text-[#BAC095] mt-0.5">
                        Type: <span className="capitalize">{hoveredSlot.type}</span> • Status:{" "}
                        {hoveredSlot.status}
                      </div>
                      <div className="text-[10px] mt-0.5 font-bold">
                        {hoveredSlot.hasEmbedding
                          ? "✓ Profile Analyzed & Indexed"
                          : "○ Pending AI Analysis"}
                      </div>
                    </div>
                  )}

                  {/* Grid Legend */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E] text-[10px] font-semibold text-[#8A8F76]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[2px] bg-[#4E7A33]" />
                      <span>Applicant (Analyzed)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[2px] bg-[#D4DE95]" />
                      <span>Imported Resume (Analyzed)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[2px] bg-[#C99A3E]" />
                      <span>Pending Analysis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[2px] bg-[#FFFFFF] dark:bg-[#202417] border border-[#D3D6C4]/60" />
                      <span>Empty Slot ({TOTAL_GRID_SLOTS - totalCandidateCount} remaining)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingestion Tabs & Bulk Upload */}
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

                {/* TAB 1A: Existing Applicants List */}
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
                                {app.resume?.embedding ? "Profile Analyzed" : "Pending Analysis"}
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

                {/* TAB 1B: Import Resumes */}
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
                        ref={(node) => {
                          folderInputRef.current = node;
                          if (node) {
                            node.setAttribute("webkitdirectory", "");
                            node.setAttribute("directory", "");
                            node.webkitdirectory = true;
                          }
                        }}
                        onChange={handleFileInputChange}
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
                          onClick={handleFolderSelect}
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
                          <span>{selectedFiles.length} file(s) queued for processing:</span>
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
                                {sc.has_embedding || sc.embedding ? "Profile Analyzed" : "Awaiting Analysis"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Trigger: AI Profile Analysis Button */}
              <div className="apl-card p-6 border-2 border-[#D4DE95] dark:border-[#383D28] bg-gradient-to-br from-[#FFFFFF] to-[#F8F9F1] dark:from-[#171911] dark:to-[#1A1D13] space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                      AI Profile Analysis & Processing
                    </h3>
                    <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                      Extracts and analyzes candidate qualifications, skills, and experience against the Job Description
                    </p>
                  </div>

                  <button
                    onClick={handleRunProfileAnalysis}
                    disabled={isAnalyzingProfiles || totalCandidateCount === 0}
                    className="apl-btn apl-btn-primary py-2.5 px-6 text-xs font-extrabold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    {isAnalyzingProfiles ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing Profiles...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze Profiles ({totalCandidateCount})
                      </>
                    )}
                  </button>
                </div>

                {/* Success message & Next Step Prompt */}
                {analysisSuccess && (
                  <div className="p-4 bg-[#4E7A33]/15 border border-[#4E7A33]/30 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4E7A33]">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{analysisMessage}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#4E7A33]/20">
                      <span className="text-[11px] text-[#3D4127] dark:text-[#D4DE95] font-semibold">
                        Ready to screen and shortlist candidates?
                      </span>
                      <button
                        onClick={() => setCurrentWorkflowTab("shortlist")}
                        className="apl-btn apl-btn-primary text-xs py-1.5 px-4 font-bold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span>Move to Next Step: AI Shortlisting</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {analysisError && (
                  <div className="p-3 bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] rounded-lg text-xs font-semibold">
                    {analysisError}
                  </div>
                )}

                {/* If already analyzed, provide quick link to step 2 */}
                {!analysisSuccess && readyCandidateCount > 0 && (
                  <div className="pt-2 flex items-center justify-between border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
                    <span className="text-xs text-[#52564A] dark:text-[#BAC095] font-medium">
                      ✓ {readyCandidateCount} candidate profiles are indexed and ready for screening.
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentWorkflowTab("shortlist")}
                      className="text-xs font-bold text-[#636B2F] dark:text-[#BAC095] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Proceed to AI Shortlisting</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2 CONTENT: SHORTLISTING CONTROLS & RANKED RESULTS           */}
      {/* ================================================================ */}
      {currentWorkflowTab === "shortlist" && (
        <div className="space-y-6 apl-animate-fade">
          {/* Screening Controls Card */}
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
                  Analyzed Profiles: {readyCandidateCount} / {totalCandidateCount}
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
                  Evaluates all resumes and promotes top {topN} to Cloudflare R2 and Job Requisition.
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

          {/* RESULTS SECTION: Ranked Shortlisted Candidates (Appears on same tab!) */}
          {/* Email Processing Feedback Banner */}
          {emailNotification && (
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                emailNotification.type === "success"
                  ? "bg-[#4E7A33]/15 border-[#4E7A33]/30 text-[#4E7A33]"
                  : emailNotification.type === "warning"
                  ? "bg-[#C99A3E]/15 border-[#C99A3E]/30 text-[#C99A3E]"
                  : "bg-[#B4453D]/15 border-[#B4453D]/30 text-[#B4453D]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base">
                  {emailNotification.type === "success" ? "✓" : emailNotification.type === "warning" ? "⚠" : "✕"}
                </span>
                <div>
                  <h4 className="font-bold">{emailNotification.message}</h4>
                  {emailNotification.results && (
                    <div className="mt-1 space-y-0.5 text-[11px] opacity-90">
                      {emailNotification.results.map((r, i) => (
                        <div key={i}>
                          &bull; {r.candidate_name} ({r.email || "No email"}): <strong>{r.status}</strong>
                          {r.error && <span className="text-red-500"> — {r.error}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotification(null)}
                className="opacity-70 hover:opacity-100 font-black text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {shortlistedResults.length > 0 ? (
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
                    Top {shortlistSummary?.shortlisted_count || shortlistedResults.length} ranked candidates evaluated by semantic match & recruiter preferences
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Select All Checkbox */}
                  <button
                    type="button"
                    onClick={toggleSelectAllCandidatesForEmail}
                    className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={
                        shortlistedResults.length > 0 &&
                        selectedCandidateIdsForEmail.length === shortlistedResults.length
                      }
                      onChange={() => {}}
                      className="cursor-pointer rounded border-[#636B2F] text-[#636B2F] focus:ring-0"
                    />
                    <span>
                      {selectedCandidateIdsForEmail.length === shortlistedResults.length
                        ? "Deselect All"
                        : "Select All"}
                    </span>
                  </button>

                  {/* Send Shortlist Email Button */}
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    disabled={selectedCandidateIdsForEmail.length === 0}
                    className={`apl-btn text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-sm transition-all ${
                      selectedCandidateIdsForEmail.length > 0
                        ? "apl-btn-primary"
                        : "opacity-40 cursor-not-allowed bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]"
                    }`}
                    title="Send official shortlist interview notification email"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>
                      Email Candidates{" "}
                      {selectedCandidateIdsForEmail.length > 0 && `(${selectedCandidateIdsForEmail.length})`}
                    </span>
                  </button>

                  {/* Move to Step 3 Shortcut */}
                  <button
                    onClick={() => setCurrentWorkflowTab("interview")}
                    className="apl-btn apl-btn-primary text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Step 3: Interview Kit</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Candidate Ranked Cards List */}
              <div className="space-y-3">
                {shortlistedResults.map((candidate, idx) => {
                  const rank = idx + 1;
                  const badge = getScoreBadge(candidate.match_score);
                  const isSelectedForEmail = selectedCandidateIdsForEmail.includes(candidate.application_id);

                  let rankBadgeStyle = "bg-[#ECEEDF] text-[#52564A] dark:bg-[#2A2E1E] dark:text-[#BAC095]";
                  if (rank === 1) rankBadgeStyle = "bg-[#D4DE95] text-[#3D4127] font-black";
                  else if (rank === 2) rankBadgeStyle = "bg-[#BAC095] text-[#3D4127] font-black";
                  else if (rank === 3) rankBadgeStyle = "bg-[#636B2F] text-white font-black";

                  return (
                    <div
                      key={candidate.application_id || idx}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelectedForEmail
                          ? "border-[#636B2F] bg-[#636B2F]/5 ring-1 ring-[#636B2F]/30"
                          : "border-[#D3D6C4] dark:border-[#2A2E1E] bg-[#F8F9F1]/40 dark:bg-[#151710]/40 hover:border-[#636B2F]"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        {/* Checkbox for email selection */}
                        <input
                          type="checkbox"
                          checked={isSelectedForEmail}
                          onChange={() => toggleSelectCandidateForEmail(candidate.application_id)}
                          className="w-4 h-4 cursor-pointer rounded border-[#636B2F] text-[#636B2F] focus:ring-0 flex-shrink-0"
                          title="Select candidate to send shortlist email"
                        />

                        {/* Rank Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-sm flex-shrink-0 apl-font-mono ${rankBadgeStyle}`}
                        >
                          #{rank}
                        </div>

                        <div className="truncate">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
                              {candidate.name}
                            </h4>

                            {/* Candidate Email extracted from resume */}
                            {candidate.email ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563eb]/10 text-[#2563eb] dark:text-[#93c5fd] border border-[#2563eb]/20 inline-flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{candidate.email}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#8A8F76] italic">
                                No email in resume
                              </span>
                            )}

                            {candidate.has_interview_kit && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30 flex items-center gap-1">
                                <span>✓ Kit Ready</span>
                              </span>
                            )}

                            {candidate.is_promoted_import && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/60 flex items-center gap-1">
                                <span>☁ Saved to Storage</span>
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
                      <div className="flex items-center gap-3.5 flex-shrink-0 self-end sm:self-auto">
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

                        {/* Interview Questions Shortcut Button */}
                        <button
                          onClick={() => {
                            setSelectedInterviewCandidate(candidate);
                            setCurrentWorkflowTab("interview");
                          }}
                          className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shadow-sm text-[#3D4127] dark:text-[#D4DE95]"
                          title="Generate or view personalized interview questions"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>{candidate.has_interview_kit ? "View Kit" : "Interview Kit"}</span>
                        </button>

                        {/* View Original Resume Button */}
                        <button
                          onClick={() => handleOpenPreview(candidate)}
                          className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Resume</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="apl-card p-12 text-center border border-dashed border-[#D3D6C4] dark:border-[#383D28] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#D4DE95]/20 text-[#636B2F] dark:text-[#BAC095] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                No Shortlisted Candidates Yet
              </h3>
              <p className="text-xs text-[#8A8F76] max-w-md mx-auto">
                Configure your target shortlisting count (N) and optional preferences above, then click <strong>"Run Shortlisting"</strong> to view ranked candidates.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3 CONTENT: COHESIVE INTERVIEW QUESTION KIT WORKSPACE        */}
      {/* ================================================================ */}
      {currentWorkflowTab === "interview" && (
        <div className="space-y-6 apl-animate-fade">
          {shortlistedResults.length === 0 ? (
            <div className="apl-card p-12 text-center border border-dashed border-[#D3D6C4] dark:border-[#383D28] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#D4DE95]/20 text-[#636B2F] dark:text-[#BAC095] flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                  No Shortlisted Candidates Available
                </h3>
                <p className="text-xs text-[#8A8F76] max-w-md mx-auto mt-1">
                  Complete <strong>Step 02: AI Shortlisting & Ranking</strong> first to shortlist top candidate profiles for personalized interview kits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentWorkflowTab("shortlist")}
                className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Go to Step 02: Shortlisting & Ranking</span>
              </button>
            </div>
          ) : (
            /* Main 2-Container Layout: Clean, grouped, no scattered divs */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ── MAIN CONTAINER 1: CANDIDATE SELECTOR & AI SETTINGS (Col 4) ── */}
              <div className="lg:col-span-4 apl-card p-5 border-2 border-[#D3D6C4] dark:border-[#2A2E1E] bg-[#FFFFFF] dark:bg-[#1E2015] shadow-sm space-y-5">
                <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#3D4127] dark:text-[#D4DE95]">
                      Candidate & Settings
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] apl-font-mono">
                      {shortlistedResults.length} Shortlisted
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8F76] mt-0.5">
                    Select a candidate and target seniority to generate personalized questions
                  </p>
                </div>

                {/* Sub-div: Candidate Selection List */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8F76]">
                    Select Candidate
                  </label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {shortlistedResults.map((candidate, idx) => {
                      const isSelected =
                        selectedInterviewCandidate?.application_id === candidate.application_id ||
                        (!selectedInterviewCandidate && idx === 0);
                      const rank = idx + 1;
                      const badge = getScoreBadge(candidate.match_score);
                      const hasKit =
                        interviewKits[candidate.application_id]?.questions?.length > 0 ||
                        candidate.has_interview_kit;

                      return (
                        <div
                          key={candidate.application_id || idx}
                          onClick={() => setSelectedInterviewCandidate(candidate)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#F8F9F1] to-white dark:from-[#171911] dark:to-[#151710] border-[#636B2F] ring-2 ring-[#636B2F]/20 shadow-sm"
                              : "bg-[#F8F9F1]/50 dark:bg-[#171911]/50 border-[#ECEEDF] dark:border-[#2A2E1E] hover:border-[#BAC095]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-[#D4DE95]/40 text-[#3D4127] dark:text-[#D4DE95] apl-font-mono">
                                #{rank}
                              </span>
                              <h4 className="text-xs font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
                                {candidate.name}
                              </h4>
                            </div>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold border apl-font-mono ${badge.colorClass}`}>
                              {candidate.match_score}%
                            </span>
                          </div>

                          {/* Candidate Email extracted from resume */}
                          <div className="text-[11px] text-[#2563eb] dark:text-[#93c5fd] font-medium truncate flex items-center gap-1 mt-1">
                            <span className="opacity-70">✉</span>
                            <span className="truncate">{candidate.email || "No email in resume"}</span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E] text-[10px]">
                            <span
                              className={`font-bold ${
                                hasKit ? "text-[#4E7A33]" : "text-[#8A8F76]"
                              }`}
                            >
                              {hasKit ? "✓ 10 Questions Ready" : "Pending AI Generation"}
                            </span>
                            <span className="text-[#636B2F] dark:text-[#BAC095] font-bold">
                              {isSelected ? "Active" : "Select →"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-div: Seniority / Difficulty Level Selector */}
                <div className="space-y-2 pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D4127] dark:text-[#D4DE95]">
                      Interview Difficulty Level
                    </label>
                    <span className="text-[10px] font-bold text-[#636B2F] dark:text-[#BAC095] apl-font-mono">
                      {interviewDifficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { level: "Junior", desc: "Basics & syntax" },
                      { level: "Mid-Level", desc: "Tradeoffs & bugs" },
                      { level: "Senior", desc: "Architecture & scale" },
                      { level: "Lead / Expert", desc: "Strategy & resilience" },
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setInterviewDifficulty(item.level)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          interviewDifficulty === item.level
                            ? "bg-[#3D4127] text-[#D4DE95] border-[#3D4127] shadow-sm"
                            : "bg-[#F8F9F1] dark:bg-[#171911] text-[#52564A] dark:text-[#BAC095] border-[#ECEEDF] dark:border-[#2A2E1E] hover:border-[#BAC095]"
                        }`}
                      >
                        <div className="text-xs font-bold">{item.level}</div>
                        <div
                          className={`text-[10px] ${
                            interviewDifficulty === item.level
                              ? "text-[#D4DE95]/80"
                              : "text-[#8A8F76]"
                          }`}
                        >
                          {item.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-div: AI Question Generation Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateInterviewKit(interviewDifficulty)}
                    disabled={isGeneratingKit || !selectedInterviewCandidate}
                    className="w-full apl-btn apl-btn-primary py-3 text-xs font-extrabold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingKit ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Analyzing Resume & Generating Questions...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>
                          {interviewKits[selectedInterviewCandidate?.application_id]?.questions?.length > 0
                            ? `Regenerate 10 Questions (${interviewDifficulty})`
                            : `Generate 10 Questions with AI`}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-[#8A8F76] text-center mt-1.5">
                    Probes candidate resume claims, tools, and projects against target JD
                  </p>
                </div>

                {/* Sub-div: Error feedback if generation fails */}
                {kitError && (
                  <div className="p-3 bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] rounded-xl text-xs font-semibold">
                    {kitError}
                  </div>
                )}
              </div>

              {/* ── MAIN CONTAINER 2: STRUCTURED QUESTIONNAIRE WORKSPACE (Col 8) ── */}
              <div className="lg:col-span-8 apl-card p-6 border-2 border-[#D3D6C4] dark:border-[#2A2E1E] bg-[#FFFFFF] dark:bg-[#1E2015] shadow-sm space-y-6">
                
                {/* Active Candidate Header Bar */}
                {selectedInterviewCandidate && (
                  <div className="p-4 rounded-xl border border-[#D4DE95] dark:border-[#383D28] bg-gradient-to-r from-[#F8F9F1] via-[#FFFFFF] to-[#F8F9F1] dark:from-[#171911] dark:to-[#1A1D13] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                          {selectedInterviewCandidate.name}
                        </h3>
                        {selectedInterviewCandidate.email && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#2563eb]/10 text-[#2563eb] dark:text-[#93c5fd] border border-[#2563eb]/20 inline-flex items-center gap-1">
                            <span>✉</span>
                            <span>{selectedInterviewCandidate.email}</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
                          Match: {selectedInterviewCandidate.match_score}%
                        </span>
                      </div>
                      <p className="text-xs text-[#8A8F76] mt-0.5">
                        Target Role: <strong>{selectedJob?.title}</strong> &bull; Level:{" "}
                        <span className="font-bold text-[#636B2F] dark:text-[#BAC095]">
                          {interviewKits[selectedInterviewCandidate.application_id]?.difficulty || interviewDifficulty}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPreview(selectedInterviewCandidate)}
                        className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Resume</span>
                      </button>

                      {interviewKits[selectedInterviewCandidate.application_id]?.questions?.length > 0 && (
                        <button
                          onClick={() => {
                            const qs = interviewKits[selectedInterviewCandidate.application_id].questions;
                            const fullText = qs
                              .map(
                                (q, i) =>
                                  `Q${i + 1} (${q.category} - ${q.topic}):\n${q.question}\n\nExpected Answer:\n${q.expected_answer}\n\nEvaluation Criteria:\n${q.evaluation_criteria}\n`
                              )
                              .join("\n---\n\n");
                            navigator.clipboard.writeText(fullText);
                            alert("Copied full interview kit (10 questions & expected answers) to clipboard!");
                          }}
                          className="apl-btn apl-btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 shadow-sm"
                          title="Copy all questions and model answers to clipboard"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span>Copy All</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-div: Display Questions or Welcome State */}
                {selectedInterviewCandidate &&
                interviewKits[selectedInterviewCandidate.application_id]?.questions?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Kit Header Summary */}
                    <div className="p-3 bg-[#4E7A33]/10 border border-[#4E7A33]/30 rounded-xl flex items-center justify-between text-xs font-bold text-[#4E7A33]">
                      <div className="flex items-center gap-2">
                        <span>✓</span>
                        <span>
                          10 Personalized Questions & Model Answers Generated for {selectedInterviewCandidate.name}
                        </span>
                      </div>
                      <span className="text-[10px] apl-font-mono uppercase px-2 py-0.5 rounded bg-[#4E7A33] text-white">
                        {interviewKits[selectedInterviewCandidate.application_id]?.difficulty || interviewDifficulty} Level
                      </span>
                    </div>

                    {/* 10 Question Cards */}
                    <div className="space-y-3.5">
                      {interviewKits[selectedInterviewCandidate.application_id].questions.map((item, qIdx) => {
                        const isExpanded = Boolean(expandedAnswers[item.id || qIdx]);

                        return (
                          <div
                            key={item.id || qIdx}
                            className="p-4 rounded-xl border border-[#D3D6C4] dark:border-[#2A2E1E] bg-[#FFFFFF] dark:bg-[#171911] space-y-3 shadow-sm hover:border-[#636B2F] transition-all"
                          >
                            {/* Card Top: Number, Category, Topic, and Copy Button */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-[#3D4127] text-[#D4DE95] text-xs font-black flex items-center justify-center apl-font-mono">
                                  {qIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-[#636B2F] dark:text-[#BAC095]">
                                  {item.category}
                                </span>
                                {item.topic && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#BAC095]">
                                    {item.topic}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleCopyQuestion(item.question, qIdx)}
                                className="text-[11px] font-bold text-[#636B2F] dark:text-[#BAC095] hover:underline flex items-center gap-1"
                              >
                                {copiedQuestionIndex === qIdx ? "✓ Copied!" : "Copy Question"}
                              </button>
                            </div>

                            {/* Question text probing resume claims */}
                            <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] leading-relaxed">
                              "{item.question}"
                            </p>

                            {/* Expandable Model Answer & Rubric Toggle */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleAnswerAccordion(item.id || qIdx)}
                                className="text-[11px] font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1.5"
                              >
                                <span>{isExpanded ? "▾ Hide Expected Answer & Rubric" : "▸ View Expected Answer & Evaluation Rubric"}</span>
                              </button>

                              {isExpanded && (
                                <div className="mt-2.5 space-y-2.5 p-3.5 rounded-xl bg-[#F8F9F1] dark:bg-[#151710] border border-[#ECEEDF] dark:border-[#2A2E1E] text-xs apl-animate-fade">
                                  {/* Section A: Ideal Candidate Answer */}
                                  <div className="space-y-1">
                                    <div className="font-extrabold text-[#166534] dark:text-[#4ade80] flex items-center gap-1">
                                      <span>✓ Expected Model Answer:</span>
                                    </div>
                                    <p className="text-[#334155] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-line pl-2 border-l-2 border-[#16a34a]">
                                      {item.expected_answer}
                                    </p>
                                  </div>

                                  {/* Section B: Evaluation Criteria & Signals */}
                                  {item.evaluation_criteria && (
                                    <div className="space-y-1 pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
                                      <div className="font-extrabold text-[#b45309] dark:text-[#fbbf24] flex items-center gap-1">
                                        <span>🔍 Interviewer Evaluation Rubric:</span>
                                      </div>
                                      <p className="text-[#334155] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-line pl-2 border-l-2 border-[#f59e0b]">
                                        {item.evaluation_criteria}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Welcome empty state inside right container */
                  <div className="py-14 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#D4DE95]/20 text-[#636B2F] dark:text-[#BAC095] flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                        Generate 10 Tailored Questions for {selectedInterviewCandidate?.name || "Candidate"}
                      </h4>
                      <p className="text-xs text-[#8A8F76] max-w-md mx-auto mt-1">
                        Our LLM analyzes the specific projects, tools, and technical claims in the candidate's resume against the Job Description to create 10 personalized questions with expected model answers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerateInterviewKit(interviewDifficulty)}
                      disabled={isGeneratingKit}
                      className="apl-btn apl-btn-primary text-xs py-2 px-6 font-extrabold shadow-md inline-flex items-center gap-2"
                    >
                      {isGeneratingKit ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Generating Questions...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Generate 10 Questions Now ({interviewDifficulty})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Shortlist Email Sending Modal ────────────────────────────── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm apl-animate-fade">
          <div className="w-full max-w-xl bg-white dark:bg-[#1E2015] rounded-2xl border-2 border-[#D4DE95] dark:border-[#383D28] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✉️</span>
                <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                  Send Shortlist Interview Notification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-[#8A8F76] hover:text-[#22241B] dark:hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Recipient Summary */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4127] dark:text-[#D4DE95]">
                Recipients ({selectedCandidateIdsForEmail.length} Selected Candidates)
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#ECEEDF] dark:border-[#2A2E1E]">
                {shortlistedResults
                  .filter((c) => selectedCandidateIdsForEmail.includes(c.application_id))
                  .map((c) => (
                    <div
                      key={c.application_id}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded bg-white dark:bg-[#1A1C12]"
                    >
                      <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#2563eb] dark:text-[#93c5fd] font-semibold truncate ml-2">
                        {c.email || "⚠ No email detected"}
                      </span>
                    </div>
                  ))}
              </div>
              <p className="text-[11px] text-[#8A8F76]">
                Emails are sent from <strong>{selectedJob?.company?.name || "Company"} Hiring Team</strong> using your configured SMTP credentials in .env.
              </p>
            </div>

            {/* Email Subject Preview */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A8F76]">
                Subject
              </label>
              <div className="p-2.5 rounded-lg bg-[#F8F9F1] dark:bg-[#171911] border border-[#ECEEDF] dark:border-[#2A2E1E] text-xs font-semibold text-[#22241B] dark:text-[#EBF0DA]">
                Congratulations [Candidate Name]! You've been shortlisted for {selectedJob?.title} at {selectedJob?.company?.name || "Our Company"}
              </div>
            </div>

            {/* Custom Note input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4127] dark:text-[#D4DE95]">
                Custom Note from Hiring Team (Optional)
              </label>
              <textarea
                rows={3}
                value={customEmailMessage}
                onChange={(e) => setCustomEmailMessage(e.target.value)}
                placeholder="e.g. Please be ready with your portfolio or Github repo link. Our recruiter will reach out with the Google Meet link shortly..."
                className="w-full text-xs p-3 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#151710] text-[#22241B] dark:text-[#EBF0DA] focus:border-[#636B2F] focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={isSendingEmails}
                className="apl-btn apl-btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendShortlistEmails}
                disabled={isSendingEmails || selectedCandidateIdsForEmail.length === 0}
                className="apl-btn apl-btn-primary text-xs py-2 px-5 font-extrabold shadow-md flex items-center gap-2"
              >
                {isSendingEmails ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#3D4127]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Emails...</span>
                  </>
                ) : (
                  <>
                    <span>✉️</span>
                    <span>Send {selectedCandidateIdsForEmail.length} Shortlist Emails</span>
                  </>
                )}
              </button>
            </div>
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