import React, { useState, useEffect, useRef } from "react";
import { getMyResumes, applyToJob } from "../../api/jobs";
import api from "../../api/axios";

/**
 * Modal for applying to a job.
 * - Fetches the applicant's resumes
 * - Lets them pick one OR upload a new one inline
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

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

  /* ── fetch resumes when modal opens ── */
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(false);
    setSelectedResumeId(null);
    setUploadFile(null);
    setUploadError(null);
    setUploading(false);
    setDragOver(false);
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

  /* ── file validation ── */
  const validateFile = (file) => {
    if (!file) return "No file selected.";
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF and DOCX files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }
    return null;
  };

  /* ── file selection ── */
  const handleFileSelect = (file) => {
    setUploadError(null);
    const err = validateFile(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadFile(file);
    // Deselect any existing resume when uploading new
    setSelectedResumeId(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeUploadedFile = () => {
    setUploadFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── submit application ── */
  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      let resumeId = selectedResumeId;

      // If user chose a new file, upload it first
      if (uploadFile && !selectedResumeId) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        const uploadRes = await api.post("/resumes/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        resumeId = uploadRes.data?.data?.id;
        setUploading(false);
      }

      const payload = resumeId ? { resume_id: resumeId } : {};
      await applyToJob(job.id, payload);
      setSuccess(true);
      setTimeout(() => {
        onApplied?.(job.id);
        onClose();
      }, 1200);
    } catch (err) {
      setUploading(false);
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit =
    !loading && (selectedResumeId || uploadFile) && !uploadError;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="rounded-[28px] border border-white/10 bg-[#0f0e1f] shadow-[0_25px_80px_rgba(5,4,14,0.7)] w-full max-w-lg overflow-hidden animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient top accent */}
          <div className="h-1 bg-gradient-to-r from-violet-500 to-cyan-400" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-violet-200/70 mb-1.5">
                  Apply to Position
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {job.company_name || job.company?.name || "Company"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 transition"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Success */}
            {success && (
              <div className="flex flex-col items-center py-6 gap-3 animate-modal-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white">Application Submitted!</h4>
                <p className="text-sm text-slate-400 text-center">
                  Your application for <strong className="text-white">{job.title}</strong> has been sent.
                </p>
              </div>
            )}

            {/* Error */}
            {error && !success && (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Resume selection + upload */}
            {!success && (
              <>
                {/* ── Upload New Resume ── */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                    Upload Resume
                  </label>

                  {uploadFile ? (
                    /* Selected file preview */
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{uploadFile.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(uploadFile.size)}</p>
                      </div>
                      <button
                        onClick={removeUploadedFile}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* Drop zone */
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all
                        ${dragOver
                          ? "border-violet-400 bg-violet-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-violet-400/40 hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-300">
                        Drop your resume here or <span className="text-violet-400">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF or DOCX • Max 5MB</p>
                    </div>
                  )}

                  {/* Upload error */}
                  {uploadError && (
                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {uploadError}
                    </p>
                  )}
                </div>

                {/* ── OR divider ── */}
                {resumes.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      or select existing
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}

                {/* ── Existing Resumes ── */}
                {resumeLoading ? (
                  <div className="flex items-center gap-3 py-6 justify-center text-slate-500">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm">Loading resumes...</span>
                  </div>
                ) : resumes.length > 0 ? (
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`
                          flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all
                          ${selectedResumeId === r.id
                            ? "border-violet-500/40 bg-violet-500/5"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                          }
                        `}
                        onClick={() => {
                          setSelectedResumeId(r.id);
                          setUploadFile(null);
                          setUploadError(null);
                        }}
                      >
                        <input
                          type="radio"
                          name="resume"
                          className="sr-only"
                          checked={selectedResumeId === r.id}
                          onChange={() => {
                            setSelectedResumeId(r.id);
                            setUploadFile(null);
                            setUploadError(null);
                          }}
                        />
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${selectedResumeId === r.id
                            ? "border-violet-400 bg-violet-500"
                            : "border-slate-600"
                          }
                        `}>
                          {selectedResumeId === r.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {extractName(r.file)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Uploaded {new Date(r.uploaded_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!canSubmit}
                className="
                  px-6 py-2.5 text-sm font-semibold rounded-full transition-all
                  bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950
                  shadow-lg shadow-violet-500/20
                  hover:brightness-110
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center gap-2
                "
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {uploading ? "Uploading…" : "Submitting…"}
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
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
          }
        `
      }} />
    </>
  );
};

export default ApplyModal;
