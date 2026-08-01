import React, { useState, useEffect } from "react";
import { getMyResumes, applyToJob } from "../../api/jobs";

/**
 * Modal for applying to a job.
 * - Fetches applicant resumes
 * - Lets applicant pick one
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
      setTimeout(() => {
        onApplied?.(job.id);
        onClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Application failed. Please try again.";
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
    return raw.replace(/_[a-zA-Z0-9]{7,}\./g, ".") || raw;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#22241B]/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="bg-[#FFFFFF] dark:bg-[#222518] rounded-xl border border-[#D3D6C4] dark:border-[#383D28] shadow-2xl w-full max-w-lg overflow-hidden apl-animate-scale"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E] flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#636B2F] dark:text-[#D4DE95]">
                Job Application Submission
              </span>
              <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA] truncate mt-0.5">
                {job.title}
              </h3>
              <p className="text-xs text-[#52564A] dark:text-[#9CA485]">
                🏢 {job.company_name || job.company?.name || "Company"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8F76] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Success State */}
            {success && (
              <div className="py-6 text-center space-y-3 apl-animate-scale">
                <div className="w-14 h-14 rounded-full bg-[#D4DE95] text-[#3D4127] flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">Application Submitted!</h4>
                <p className="text-xs text-[#52564A] dark:text-[#9CA485] max-w-xs mx-auto">
                  Your application for <strong>{job.title}</strong> has been transmitted to the recruiter.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !success && (
              <div className="p-3.5 rounded-lg bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Resume Selection */}
            {!success && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#52564A] dark:text-[#9CA485]">
                  Select Resume for Application
                </label>

                {resumeLoading ? (
                  <div className="py-8 text-center text-xs text-[#8A8F76] space-y-2">
                    <div className="w-6 h-6 border-2 border-[#D4DE95] border-t-transparent rounded-full animate-spin mx-auto" />
                    <span>Loading uploaded resumes...</span>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28] text-center space-y-2">
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">No resume on file</p>
                    <p className="text-[11px] text-[#8A8F76]">
                      Please upload a resume on the Resume Analysis page first, then return to submit your application.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((r) => {
                      const isSelected = selectedResumeId === r.id;
                      return (
                        <label
                          key={r.id}
                          className={`
                            flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                            ${isSelected
                              ? "border-[#D4DE95] bg-[#D4DE95]/15"
                              : "border-[#D3D6C4] dark:border-[#383D28] hover:border-[#8A8F76]"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="resume"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => setSelectedResumeId(r.id)}
                          />
                          <div className={`
                            w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${isSelected ? "border-[#3D4127] bg-[#3D4127]" : "border-[#8A8F76]"}
                          `}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#D4DE95]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                              📄 {extractName(r.file)}
                            </p>
                            <p className="text-[10px] text-[#8A8F76] mt-0.5">
                              Uploaded {new Date(r.uploaded_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="px-6 py-4 border-t border-[#ECEEDF] dark:border-[#2A2E1E] flex justify-end gap-3 bg-[#F8F9F1]/50 dark:bg-[#171911]/50">
              <button
                onClick={onClose}
                className="apl-btn apl-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading || (resumes.length > 0 && !selectedResumeId)}
                className="apl-btn apl-btn-primary text-xs shadow-md"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApplyModal;
