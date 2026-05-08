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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden group">
      {/* Top color accent based on status */}
      <div className={`h-0.5 ${
        applicant.status === "SHORTLISTED" ? "bg-emerald-500" :
        applicant.status === "INTERVIEW" ? "bg-purple-500" :
        applicant.status === "REJECTED" ? "bg-red-500" :
        "bg-blue-500"
      }`} />

      <div className="p-5 sm:p-6">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white">
                {(applicant.applicant_name || applicant.applicant_email || "?")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {applicant.applicant_name || "Unnamed Applicant"}
              </h4>
              <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {applicant.applicant_email}
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
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-medium text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Applied {formatDate(applicant.applied_at)} ({timeAgo(applicant.applied_at)})
          </span>

          {/* AI Match Score placeholder */}
          {applicant.match_score != null ? (
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
              ${applicant.match_score >= 80
                ? "bg-emerald-50 text-emerald-700"
                : applicant.match_score >= 60
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
              }
            `}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {applicant.match_score}% match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-medium text-gray-400">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Resume
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No resume attached
            </span>
          )}
        </div>

        {/* Notes section */}
        <div className="pt-3 border-t border-gray-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
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
