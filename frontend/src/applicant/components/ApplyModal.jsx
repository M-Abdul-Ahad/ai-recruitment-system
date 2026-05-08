import React, { useState, useEffect } from "react";
import { getMyResumes, applyToJob } from "../../api/jobs";

/**
 * Modal for applying to a job.
 * - Fetches the applicant's resumes
 * - Lets them pick one
 * - Submits via POST /api/jobs/:id/apply/
 *
 * @param {{ isOpen, onClose, job, onApplied }} props
 */
const ApplyModal = ({ isOpen, onClose, job, onApplied }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* ── fetch resumes when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    // reset state every time modal opens
    setError(null);
    setSuccess(false);
    setSelectedResumeId(null);
    fetchResumes();
  }, [isOpen]);

  const fetchResumes = async () => {
    setResumeLoading(true);
    try {
      const res = await getMyResumes();
      setResumes(res.data);
      if (res.data.length === 1) setSelectedResumeId(res.data[0].id);
    } catch {
      setError("Failed to load resumes. Please try again.");
    } finally {
      setResumeLoading(false);
    }
  };

  /* ── submit application ── */
  const handleApply = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = selectedResumeId ? { resume_id: selectedResumeId } : {};
      await applyToJob(job.id, payload);
      setSuccess(true);
      // notify parent after a short delay so user sees the success state
      setTimeout(() => {
        onApplied?.(job.id);
        onClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Application failed. Please try again.";
      // Handle duplicate gracefully
      if (msg.toLowerCase().includes("already applied")) {
        setError("You have already applied to this job.");
        setTimeout(() => {
          onApplied?.(job.id);
          onClose();
        }, 1500);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  /* ── filename extraction helper ── */
  const extractName = (filePath) => {
    if (!filePath) return "Untitled Resume";
    const parts = filePath.split("/");
    const raw = parts[parts.length - 1];
    // remove hash suffixes like _aB3cD4e.pdf → filename.pdf
    return raw.replace(/_[a-zA-Z0-9]{7,}\./g, ".") || raw;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-1">
                  Apply to Job
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {job.company_name || job.company?.name || "Company"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Success */}
            {success && (
              <div className="flex flex-col items-center py-6 gap-3 animate-modal-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Application Submitted!</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
                  Your application for <strong>{job.title}</strong> has been sent successfully.
                </p>
              </div>
            )}

            {/* Error */}
            {error && !success && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Resume selection */}
            {!success && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                    Select Resume
                  </label>

                  {resumeLoading ? (
                    <div className="flex items-center gap-3 py-6 justify-center text-gray-400">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                        <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span className="text-sm">Loading resumes...</span>
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="flex flex-col items-center py-6 gap-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-1">
                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No resumes uploaded</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Upload a resume first from the Resume Analysis page, then come back to apply.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map((r) => (
                        <label
                          key={r.id}
                          className={`
                            flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${selectedResumeId === r.id
                              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 dark:border-indigo-400"
                              : "border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="resume"
                            className="sr-only"
                            checked={selectedResumeId === r.id}
                            onChange={() => setSelectedResumeId(r.id)}
                          />
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                            ${selectedResumeId === r.id
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-gray-300 dark:border-slate-600"
                            }
                          `}>
                            {selectedResumeId === r.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">
                              {extractName(r.file)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                              Uploaded {new Date(r.uploaded_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Match placeholder - extensible for future */}
                {/* <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                  <p className="text-xs font-bold text-violet-600">🤖 AI Match Score: Coming soon</p>
                </div> */}
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading || (resumes.length > 0 && !selectedResumeId)}
                className="
                  px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all
                  bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center gap-2
                "
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-modal-in {
            animation: modalIn 0.25s ease-out forwards;
          }
        `
      }} />
    </>
  );
};

export default ApplyModal;
