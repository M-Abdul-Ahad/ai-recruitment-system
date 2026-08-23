import React from "react";
import StatusDropdown from "./StatusDropdown";
import RecruiterNotesEditor from "./RecruiterNotesEditor";

/**
 * Detailed applicant card for the candidate management page.
 *
 * @param {{
 *   applicant: object,
 *   onStatusChange: (appId, newStatus) => Promise<void>,
 *   onNotesChange: (appId, notes) => Promise<void>,
 *   onViewResume: (applicant) => void,
 *   statusUpdating?: number|null,
 * }} props
 */
const ApplicantCard = ({ applicant, onStatusChange, onNotesChange, onViewResume, statusUpdating }) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const isUpdating = statusUpdating === applicant.id;

  return (
    <div className="apl-card apl-card-hover overflow-hidden relative group transition-all duration-300">
      {/* Top color accent based on status */}
      <div className={`h-1 absolute top-0 left-0 right-0 ${
        applicant.status === "SHORTLISTED" ? "bg-[#4E7A33]" :
        applicant.status === "INTERVIEW" ? "bg-[#C99A3E]" :
        applicant.status === "REJECTED" ? "bg-[#B4453D]" :
        "bg-[#3E7285]"
      }`} />

      <div className="pt-2">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm shadow-sm border ${
              applicant.source_type === 'RECRUITER_UPLOAD'
                ? 'bg-[#3E7285]/15 text-[#3E7285] border-[#3E7285]/20'
                : 'bg-[#D4DE95] text-[#3D4127] border-[#3D4127]/10'
            }`}>
              {(applicant.applicant_name || applicant.applicant_email || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                  {applicant.applicant_name || "Unnamed Applicant"}
                </h4>
                {applicant.source_type === 'RECRUITER_UPLOAD' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3E7285]/10 text-[#3E7285] border border-[#3E7285]/20 text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Imported
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] truncate flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {applicant.applicant_email || 'No email'}
              </p>
            </div>
          </div>

          <StatusDropdown
            currentStatus={applicant.status}
            onStatusChange={(s) => onStatusChange(applicant.id, s)}
            disabled={isUpdating}
          />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[11px] font-semibold text-[#52564A] dark:text-[#9CA485]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Applied {formatDate(applicant.applied_at)} ({timeAgo(applicant.applied_at)})
          </span>

          {/* AI Match Score badge */}
          {applicant.match_score != null ? (
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold apl-font-mono border
              ${applicant.match_score >= 80
                ? "bg-[#4E7A33]/15 text-[#4E7A33] border-[#4E7A33]/30"
                : applicant.match_score >= 60
                ? "bg-[#C99A3E]/15 text-[#C99A3E] border-[#C99A3E]/30"
                : "bg-[#B4453D]/15 text-[#B4453D] border-[#B4453D]/30"
              }
            `}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {applicant.match_score}% match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[11px] font-medium text-[#8A8F76] border border-[#D3D6C4]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI score pending
            </span>
          )}
        </div>

        {/* Resume row */}
        <div className="flex items-center gap-2 mb-4">
          {applicant.resume_file ? (
            <button
              onClick={() => onViewResume(applicant)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] bg-[#D4DE95]/20 dark:bg-[#D4DE95]/10 hover:bg-[#D4DE95]/30 rounded-lg border border-[#D4DE95]/40 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Resume
            </button>
          ) : (
            <span className="text-xs text-[#8A8F76] italic flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No resume attached
            </span>
          )}
        </div>

        {/* Notes section */}
        <div className="pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8F76] mb-2">
            Recruiter Notes
          </p>
          <RecruiterNotesEditor
            notes={applicant.recruiter_notes || ""}
            onSave={(newNotes) => onNotesChange(applicant.id, newNotes)}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantCard;
