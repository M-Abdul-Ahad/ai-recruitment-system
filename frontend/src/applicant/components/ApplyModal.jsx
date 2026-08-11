import React, { useState, useEffect, useRef } from "react";
import { getMyResumes, applyToJob, uploadResume } from "../../api/jobs";

/**
 * Modal for applying to a job.
 * - Fetches applicant's stored resumes
 * - Selects latest stored resume by default
 * - Allows uploading a new resume (PDF/DOCX) directly inside the modal
 * - Submits via POST /api/jobs/:id/apply/
 *
 * @param {{ isOpen: boolean, onClose: () => void, job: object, onApplied: (jobId: number) => void }} props
 */
const ApplyModal = ({ isOpen, onClose, job, onApplied }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  /* ── fetch resumes when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setUploadError(null);
    setUploadSuccess(null);
    setSuccess(false);
    setSelectedResumeId(null);
    fetchResumes();
  }, [isOpen]);

  const fetchResumes = async () => {
    setResumeLoading(true);
    try {
      const res = await getMyResumes();
      const list = res.data || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0].id);
      }
    } catch {
      setError("Failed to load stored resumes.");
    } finally {
      setResumeLoading(false);
    }
  };

  /* ── direct file upload handler ── */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      setUploadError('Only PDF and DOCX files are allowed.');
      event.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      event.target.value = '';
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setFileUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadResume(formData);
      const newResume = res.data?.data || res.data;

      if (newResume && newResume.id) {
        setResumes(prev => [newResume, ...prev]);
        setSelectedResumeId(newResume.id);
        setUploadSuccess(`"${file.name}" uploaded and selected!`);
      } else {
        await fetchResumes();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to upload resume file.';
      setUploadError(msg);
    } finally {
      setFileUploading(false);
      event.target.value = '';
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
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileSelect}
        className="hidden"
      />

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
              title="Close modal"
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

            {/* Upload Error / Success Banners */}
            {uploadError && !success && (
              <div className="p-3 rounded-lg bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {uploadError}</span>
              </div>
            )}

            {uploadSuccess && !success && (
              <div className="p-3 rounded-lg bg-[#4E7A33]/10 border border-[#4E7A33]/30 text-[#4E7A33] text-xs font-semibold flex items-center gap-2">
                <span>✓ {uploadSuccess}</span>
              </div>
            )}

            {/* Resume Selection & Upload Section */}
            {!success && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#52564A] dark:text-[#9CA485]">
                    Select or Upload Resume
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileUploading}
                    className="text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] hover:underline flex items-center gap-1"
                  >
                    <span>+ Upload New File</span>
                  </button>
                </div>

                {/* Upload Status Loading */}
                {fileUploading && (
                  <div className="p-4 rounded-xl bg-[#D4DE95]/15 border border-[#D4DE95]/40 text-center space-y-2">
                    <div className="w-5 h-5 border-2 border-[#3D4127] dark:border-[#D4DE95] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                      Uploading & parsing resume file...
                    </p>
                  </div>
                )}

                {resumeLoading ? (
                  <div className="py-8 text-center text-xs text-[#8A8F76] space-y-2">
                    <div className="w-6 h-6 border-2 border-[#D4DE95] border-t-transparent rounded-full animate-spin mx-auto" />
                    <span>Loading uploaded resumes...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Stored Resumes List */}
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
                              Uploaded {r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recently"}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E7A33] dark:text-[#D4DE95] bg-[#4E7A33]/10 px-2 py-0.5 rounded">
                              Selected
                            </span>
                          )}
                        </label>
                      );
                    })}

                    {/* Direct Upload Dropzone Button */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D3D6C4] dark:border-[#383D28] hover:border-[#636B2F] dark:hover:border-[#D4DE95] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#F8F9F1]/50 dark:bg-[#171911]/50 group mt-3"
                    >
                      <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                        📎 Upload a new PDF or DOCX resume
                      </p>
                      <p className="text-[11px] text-[#8A8F76] mt-0.5">
                        Supports .pdf, .docx (Max 10MB)
                      </p>
                    </div>
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
                disabled={loading || fileUploading || (resumes.length > 0 && !selectedResumeId)}
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
