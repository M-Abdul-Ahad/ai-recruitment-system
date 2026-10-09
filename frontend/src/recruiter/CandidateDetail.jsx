import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui";
import { MOCK_CANDIDATES, MOCK_JOBS } from "./mockShortlistingData";

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const candidateId = parseInt(id, 10) || 1;

  // Find candidate or fallback to first candidate
  const initialCandidate = useMemo(() => {
    return MOCK_CANDIDATES.find(c => c.id === candidateId) || MOCK_CANDIDATES[0];
  }, [candidateId]);

  const [candidate, setCandidate] = useState(initialCandidate);
  const [activeTab, setActiveTab] = useState("xai"); // "xai", "resume", "document"
  const [notes, setNotes] = useState(candidate.recruiterNotes || "");
  const [selectedTags, setSelectedTags] = useState(["Culture Fit", "Strong Communicator"]);

  const relatedJob = useMemo(() => {
    return MOCK_JOBS.find(j => j.id === candidate.jobId) || MOCK_JOBS[0];
  }, [candidate.jobId]);

  // Status Updater
  const handleStatusChange = (newStatus) => {
    setCandidate(prev => ({ ...prev, status: newStatus }));
    toast.success(`Candidate status updated to ${newStatus.toLowerCase()}!`);
  };

  // Toggle Shortlist
  const handleToggleShortlist = () => {
    const nextStatus = candidate.status === "SHORTLISTED" ? "APPLIED" : "SHORTLISTED";
    handleStatusChange(nextStatus);
  };

  // Save Notes
  const handleSaveNotes = () => {
    toast.success("Recruiter notes saved successfully.");
  };

  // Toggle quick tag
  const handleToggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Score styling
  const scoreColor =
    candidate.overallScore >= 85
      ? "text-[#4E7A33] border-[#4E7A33]"
      : candidate.overallScore >= 70
      ? "text-[#C99A3E] border-[#C99A3E]"
      : "text-[#B4453D] border-[#B4453D]";

  return (
    <div className="apl-animate-fade max-w-6xl mx-auto space-y-6 pb-12">
      {/* ── Breadcrumb & Navigation ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8A8F76] dark:text-[#9CA485] mb-2">
          <Link
            to={`/recruiter/shortlist/${candidate.jobId}`}
            className="hover:text-[#3D4127] dark:hover:text-[#D4DE95] transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shortlisting ({relatedJob.title})
          </Link>
          <span>/</span>
          <span className="text-[#3D4127] dark:text-[#D4DE95]">{candidate.name}</span>
        </div>
      </div>

      {/* ── Candidate Profile Hero Card ─────────────────────────────────────── */}
      <div className="apl-card p-6 border border-[#D3D6C4] dark:border-[#383D28] bg-white dark:bg-[#222518]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${candidate.avatarBg} font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0`}
            >
              {candidate.initials}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
                  {candidate.name}
                </h1>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    candidate.status === "SHORTLISTED"
                      ? "bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30"
                      : candidate.status === "INTERVIEW"
                      ? "bg-[#C99A3E]/15 text-[#C99A3E] border border-[#C99A3E]/30"
                      : candidate.status === "REJECTED"
                      ? "bg-[#B4453D]/15 text-[#B4453D] border border-[#B4453D]/30"
                      : "bg-[#3E7285]/15 text-[#3E7285] border border-[#3E7285]/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      candidate.status === "SHORTLISTED"
                        ? "bg-[#4E7A33]"
                        : candidate.status === "INTERVIEW"
                        ? "bg-[#C99A3E]"
                        : candidate.status === "REJECTED"
                        ? "bg-[#B4453D]"
                        : "bg-[#3E7285]"
                    }`}
                  />
                  {candidate.status}
                </span>

                {/* Source Badge */}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] flex items-center gap-1">
                  {candidate.source === "EXTERNAL_UPLOAD" ? (
                    <>
                      <svg className="w-3 h-3 text-[#3E7285]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {candidate.fileName}
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 text-[#4E7A33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Direct Applicant
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#52564A] dark:text-[#9CA485]">
                {candidate.roleTitle} • {candidate.currentCompany}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8F76] dark:text-[#9CA485] pt-1">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {candidate.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {candidate.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {candidate.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center justify-start lg:justify-end">
            <button
              onClick={handleToggleShortlist}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                candidate.status === "SHORTLISTED"
                  ? "bg-[#4E7A33] text-white"
                  : "bg-[#D4DE95] text-[#3D4127] hover:bg-[#c6d17e]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {candidate.status === "SHORTLISTED" ? "Shortlisted ✓" : "Shortlist Candidate"}
            </button>

            <button
              onClick={() => handleStatusChange("INTERVIEW")}
              className="apl-btn apl-btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Interview
            </button>

            <button
              onClick={() => handleStatusChange("REJECTED")}
              className="p-2 rounded-xl text-[#8A8F76] hover:text-[#B4453D] hover:bg-[#B4453D]/10 border border-[#ECEEDF] dark:border-[#2A2E1E] transition-colors"
              title="Decline / Reject Candidate"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Match Scorecard Banner ──────────────────────────────────────── */}
      <div className="apl-card p-6 bg-white dark:bg-[#222518] border border-[#D3D6C4] dark:border-[#383D28] shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Dial / Score */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#ECEEDF] dark:text-[#2A2E1E]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={candidate.overallScore >= 80 ? "text-[#4E7A33] dark:text-[#86EFAC]" : "text-[#C99A3E] dark:text-[#FDE047]"}
                  strokeDasharray={`${candidate.overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
                  {candidate.overallScore}%
                </span>
                <span className="text-[9px] uppercase font-bold text-[#8A8F76] dark:text-[#9CA485]">Match</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3D4127] dark:text-[#D4DE95] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {candidate.tier}
              </span>
              <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA] mt-0.5">
                Composite AI Match Assessment
              </h3>
              <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 max-w-lg leading-relaxed">
                {candidate.aiSummary}
              </p>
            </div>
          </div>

          {/* 4 Pillars Breakdown Metric Cards */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-[#F8F9F1] dark:bg-[#171911] p-3 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-1">
              <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
                Semantic Embeddings
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-black text-[#4E7A33] dark:text-[#86EFAC] apl-font-mono">
                  {candidate.subScores.semantic}%
                </span>
                <div className="w-16 h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4E7A33] dark:bg-[#86EFAC]" style={{ width: `${candidate.subScores.semantic}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9F1] dark:bg-[#171911] p-3 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-1">
              <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
                Skills Taxonomy
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-black text-[#3D4127] dark:text-[#D4DE95] apl-font-mono">
                  {candidate.subScores.skills}%
                </span>
                <div className="w-16 h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4DE95]" style={{ width: `${candidate.subScores.skills}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9F1] dark:bg-[#171911] p-3 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-1">
              <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
                Experience Duration
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-black text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
                  {candidate.subScores.experience}%
                </span>
                <div className="w-16 h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3D4127] dark:bg-[#D4DE95]" style={{ width: `${candidate.subScores.experience}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9F1] dark:bg-[#171911] p-3 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-1">
              <span className="text-[10px] font-bold text-[#8A8F76] dark:text-[#9CA485] uppercase tracking-wider block">
                Education & Creds
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-black text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
                  {candidate.subScores.education}%
                </span>
                <div className="w-16 h-1.5 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8A8F76] dark:bg-[#9CA485]" style={{ width: `${candidate.subScores.education}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabbed Navigation ──────────────────────────────────────────────── */}
      <div className="flex border-b border-[#ECEEDF] dark:border-[#2A2E1E] gap-2">
        <button
          onClick={() => setActiveTab("xai")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "xai"
              ? "border-[#3D4127] text-[#3D4127] dark:border-[#D4DE95] dark:text-[#D4DE95]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Explainability & Skills Matrix
        </button>

        <button
          onClick={() => setActiveTab("resume")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "resume"
              ? "border-[#3D4127] text-[#3D4127] dark:border-[#D4DE95] dark:text-[#D4DE95]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Structured Work History & Career
        </button>

        <button
          onClick={() => setActiveTab("document")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "document"
              ? "border-[#3D4127] text-[#3D4127] dark:border-[#D4DE95] dark:text-[#D4DE95]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Original Document Preview
        </button>
      </div>

      {/* ── TAB 1: AI EXPLAINABILITY & SKILLS MATRIX ────────────────────────── */}
      {activeTab === "xai" && (
        <div className="space-y-6">
          {/* Skills Alignment Matrix */}
          <div className="apl-card p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                Skills Alignment Matrix
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Direct comparison between candidate's extracted profile and the requisition criteria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl bg-[#4E7A33]/5 border border-[#4E7A33]/20 space-y-2">
                <span className="text-xs font-bold text-[#4E7A33] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Matched Required Skills ({candidate.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.matchedSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl bg-[#B4453D]/5 border border-[#B4453D]/20 space-y-2">
                <span className="text-xs font-bold text-[#B4453D] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missing / Unverified Skills ({candidate.missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.missingSkills.length === 0 ? (
                    <span className="text-xs text-[#8A8F76] italic">No major skills missing</span>
                  ) : (
                    candidate.missingSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#B4453D]/15 text-[#B4453D] border border-[#B4453D]/30"
                      >
                        {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Bonus / Value-Add Skills */}
              <div className="p-4 rounded-xl bg-[#3E7285]/5 border border-[#3E7285]/20 space-y-2">
                <span className="text-xs font-bold text-[#3E7285] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Value-Add / Bonus Skills ({candidate.bonusSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.bonusSkills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#3E7285]/15 text-[#3E7285] border border-[#3E7285]/30"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Potential Concerns (SWOT style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Strengths */}
            <div className="apl-card p-6 space-y-3 border-l-4 border-l-[#4E7A33]">
              <h3 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#4E7A33]/15 text-[#4E7A33] flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                Demonstrated Strengths
              </h3>
              <ul className="space-y-2 pt-1">
                {candidate.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-[#52564A] dark:text-[#9CA485] flex items-start gap-2 leading-relaxed">
                    <span className="text-[#4E7A33] font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas of Concern */}
            <div className="apl-card p-6 space-y-3 border-l-4 border-l-[#C99A3E]">
              <h3 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#C99A3E]/15 text-[#C99A3E] flex items-center justify-center font-bold text-xs">
                  !
                </span>
                Areas of Caution & Skill Gaps
              </h3>
              <ul className="space-y-2 pt-1">
                {candidate.concerns.length === 0 ? (
                  <li className="text-xs text-[#8A8F76] italic">No major red flags detected.</li>
                ) : (
                  candidate.concerns.map((con, idx) => (
                    <li key={idx} className="text-xs text-[#52564A] dark:text-[#9CA485] flex items-start gap-2 leading-relaxed">
                      <span className="text-[#C99A3E] font-bold mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* AI-Generated Dynamic Interview Questions */}
          <div className="apl-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3D4127] dark:text-[#D4DE95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI-Suggested Interview Questions (Targeted for Gaps)
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Questions auto-generated by Gemini to test the candidate on specific missing competencies or architectural tradeoffs.
                </p>
              </div>
              <span className="text-xs font-bold text-[#8A8F76] bg-[#ECEEDF] dark:bg-[#2A2E1E] px-2.5 py-1 rounded-full">
                {candidate.interviewQuestions?.length || 0} Questions
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {candidate.interviewQuestions?.map((iq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3D4127] text-[#D4DE95] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#22241B] dark:text-[#EBF0DA] leading-snug">
                      "{iq.question}"
                    </p>
                  </div>
                  <div className="pl-7 text-xs text-[#52564A] dark:text-[#9CA485] bg-white/60 dark:bg-[#222518]/60 p-2.5 rounded-lg border border-[#ECEEDF] dark:border-[#2A2E1E]">
                    <span className="font-extrabold text-[#3D4127] dark:text-[#D4DE95] mr-1">What to evaluate:</span>
                    {iq.lookFor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Evaluation Notes */}
          <div className="apl-card p-6 space-y-4">
            <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Recruiter Evaluation & Internal Notes
            </h3>
            
            {/* Quick tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#8A8F76]">Tags:</span>
              {[
                "Culture Fit",
                "Strong Communicator",
                "High Priority",
                "Salary Sensitive",
                "Notice Period <30d",
                "Verified References"
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTags.includes(tag)
                      ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127]"
                      : "bg-[#F8F9F1] dark:bg-[#171911] text-[#8A8F76] border border-[#ECEEDF] dark:border-[#2A2E1E]"
                  }`}
                >
                  {selectedTags.includes(tag) ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add recruiter feedback, interview impressions, or hiring team notes..."
              className="w-full p-3 rounded-xl text-xs bg-[#F8F9F1] dark:bg-[#171911] text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E] focus:outline-none focus:ring-2 focus:ring-[#D4DE95]"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="apl-btn apl-btn-primary py-2 px-5 text-xs shadow-sm cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: STRUCTURED WORK HISTORY ─────────────────────────────────── */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <div className="apl-card p-6 space-y-6">
            <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                Professional Career Timeline
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Extracted work experience and validated project history.
              </p>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECEEDF] dark:before:bg-[#2A2E1E]">
              {candidate.experienceTimeline?.map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Dot */}
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#222518] bg-[#3D4127] dark:bg-[#D4DE95]" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                      {item.role}
                    </h4>
                    <span className="text-xs font-bold text-[#8A8F76] apl-font-mono bg-[#ECEEDF] dark:bg-[#2A2E1E] px-2.5 py-0.5 rounded-full">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95]">
                    {item.company}
                  </p>
                  <p className="text-xs text-[#52564A] dark:text-[#9CA485] leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="pt-6 border-t border-[#ECEEDF] dark:border-[#2A2E1E] space-y-3">
              <h4 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                Education & Credentials
              </h4>
              <div className="p-4 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#ECEEDF] dark:border-[#2A2E1E] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    {candidate.education}
                  </p>
                  <p className="text-[11px] text-[#8A8F76]">Verified Degree Certificate</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#4E7A33]/15 text-[#4E7A33]">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ORIGINAL DOCUMENT PREVIEW ───────────────────────────────── */}
      {activeTab === "document" && (
        <div className="apl-card p-0 overflow-hidden border border-[#D3D6C4] dark:border-[#383D28]">
          {/* Document Toolbar Mockup */}
          <div className="p-3 bg-[#F8F9F1] dark:bg-[#171911] border-b border-[#ECEEDF] dark:border-[#2A2E1E] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {candidate.fileName || `${candidate.name.replace(" ", "_")}_Resume.pdf`}
              </span>
              <span className="text-[#8A8F76]">|</span>
              <span className="text-[#8A8F76]">Page 1 of 2</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.info("Simulated: Zoom Out")}
                className="p-1 rounded hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] text-[#8A8F76]"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[11px] font-bold text-[#8A8F76]">100%</span>
              <button
                onClick={() => toast.info("Simulated: Zoom In")}
                className="p-1 rounded hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] text-[#8A8F76]"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => toast.success("Resume downloaded.")}
                className="ml-3 apl-btn apl-btn-primary py-1 px-3 text-xs flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          {/* Document Preview Canvas Mockup */}
          <div className="bg-[#52564A]/10 dark:bg-black/40 p-8 flex justify-center min-h-[500px]">
            <div className="bg-white text-black p-8 sm:p-12 shadow-2xl rounded-sm max-w-2xl w-full space-y-6 font-serif">
              <div className="border-b pb-4 text-center">
                <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">
                  {candidate.name}
                </h2>
                <p className="text-xs font-sans text-gray-600 mt-1">
                  {candidate.roleTitle} • {candidate.email} • {candidate.phone} • {candidate.location}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1 mb-2 font-sans">
                  Professional Summary
                </h3>
                <p className="text-xs text-gray-800 leading-relaxed font-sans">
                  {candidate.aiSummary}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1 mb-2 font-sans">
                  Core Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-1 font-sans text-xs">
                  {candidate.matchedSkills.concat(candidate.bonusSkills || []).map((sk, i) => (
                    <span key={i} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1 mb-2 font-sans">
                  Experience
                </h3>
                <div className="space-y-4 font-sans text-xs">
                  {candidate.experienceTimeline?.map((exp, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{exp.role} — {exp.company}</span>
                        <span className="text-gray-500 text-[11px]">{exp.period}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[11px]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1 mb-2 font-sans">
                  Education
                </h3>
                <p className="text-xs text-gray-800 font-sans">{candidate.education}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}