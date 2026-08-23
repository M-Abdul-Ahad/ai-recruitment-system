import React, { useState, useRef, useCallback } from 'react';
import { bulkUploadResumes } from '../../api/jobs';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const validateFile = (file) => {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) return `Invalid file type. Only PDF and DOCX are allowed.`;
  if (file.size > MAX_FILE_SIZE_BYTES) return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
  return null;
};

/**
 * BulkUploadModal — recruiter bulk resume import for a specific job.
 *
 * Props:
 *   isOpen      {boolean}
 *   onClose     {() => void}
 *   job         {object}   — the Job object {id, title}
 *   onSuccess   {() => void} — called after a successful upload to refresh candidate list
 */
const BulkUploadModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [files, setFiles] = useState([]);        // { file, error }[]
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100
  const [uploadResult, setUploadResult] = useState(null);  // API response after upload
  const fileInputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const mapped = Array.from(incoming).map((file) => ({
      file,
      error: validateFile(file),
    }));
    setFiles((prev) => {
      // Deduplicate by name
      const existingNames = new Set(prev.map((f) => f.file.name));
      const unique = mapped.filter((f) => !existingNames.has(f.file.name));
      return [...prev, ...unique];
    });
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validFiles = files.filter((f) => !f.error);
  const invalidFiles = files.filter((f) => f.error);

  const handleUpload = async () => {
    if (validFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    try {
      const res = await bulkUploadResumes(
        job.id,
        validFiles.map((f) => f.file),
        (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      );
      setUploadResult({ success: true, data: res.data });
      setFiles([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      const serverErrors =
        err.response?.data?.details || err.response?.data?.error || 'Upload failed. Please try again.';
      setUploadResult({ success: false, error: serverErrors });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setUploadResult(null);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22241B]/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#222518] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#D3D6C4] dark:border-[#383D28] overflow-hidden apl-animate-scale">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#ECEEDF] dark:border-[#2A2E1E]">
          <div>
            <h2 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
              Bulk Import Resumes
            </h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-1">
              Import candidate resumes for <span className="font-bold text-[#3D4127] dark:text-[#D4DE95]">{job.title}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-xl text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors disabled:opacity-40"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Success result */}
          {uploadResult?.success && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#4E7A33]/10 border border-[#4E7A33]/30">
              <svg className="w-5 h-5 text-[#4E7A33] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-[#4E7A33]">
                  {uploadResult.data?.message || `Successfully imported ${uploadResult.data?.count} resume(s).`}
                </p>
                {uploadResult.data?.errors?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-[#C99A3E]">Some files were skipped on the server:</p>
                    {uploadResult.data.errors.map((e, i) => (
                      <p key={i} className="text-xs text-[#B4453D]">• {e}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleClose}
                  className="mt-3 apl-btn apl-btn-primary py-1.5 px-4 text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error result */}
          {uploadResult?.success === false && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#B4453D]/10 border border-[#B4453D]/30">
              <svg className="w-5 h-5 text-[#B4453D] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-[#B4453D]">Upload failed</p>
                <p className="text-xs text-[#B4453D]/80 mt-0.5">{uploadResult.error}</p>
                <button
                  onClick={() => setUploadResult(null)}
                  className="mt-2 text-xs font-bold text-[#B4453D] underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!uploadResult && (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#3D4127] bg-[#D4DE95]/20 dark:bg-[#D4DE95]/10 scale-[1.01]'
                    : 'border-[#D3D6C4] dark:border-[#383D28] bg-[#F8F9F1] dark:bg-[#171911] hover:border-[#8A8F76] hover:bg-[#ECEEDF]/50 dark:hover:bg-[#2A2E1E]/50'
                } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div className="w-14 h-14 rounded-2xl bg-[#D4DE95]/20 dark:bg-[#D4DE95]/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#3D4127] dark:text-[#D4DE95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    {isDragging ? 'Drop files here' : 'Drag & drop resumes here'}
                  </p>
                  <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-1">
                    or <span className="text-[#3D4127] dark:text-[#D4DE95] font-bold underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-[#8A8F76] mt-2">PDF or DOCX · Max {MAX_FILE_SIZE_MB}MB per file</p>
                </div>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8A8F76]">
                      Selected files ({files.length})
                    </p>
                    <div className="flex items-center gap-3">
                      {validFiles.length > 0 && (
                        <span className="text-[11px] font-semibold text-[#4E7A33]">
                          {validFiles.length} valid
                        </span>
                      )}
                      {invalidFiles.length > 0 && (
                        <span className="text-[11px] font-semibold text-[#B4453D]">
                          {invalidFiles.length} invalid
                        </span>
                      )}
                      <button
                        onClick={() => setFiles([])}
                        className="text-[11px] font-bold text-[#8A8F76] hover:text-[#B4453D] transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {files.map((f, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm ${
                          f.error
                            ? 'bg-[#B4453D]/5 border-[#B4453D]/20'
                            : 'bg-white dark:bg-[#1D2015] border-[#D3D6C4] dark:border-[#383D28]'
                        }`}
                      >
                        {/* File icon */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${
                          f.error
                            ? 'bg-[#B4453D]/10 text-[#B4453D]'
                            : 'bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]'
                        }`}>
                          {f.file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#22241B] dark:text-[#EBF0DA] truncate">
                            {f.file.name}
                          </p>
                          {f.error ? (
                            <p className="text-[11px] text-[#B4453D]">{f.error}</p>
                          ) : (
                            <p className="text-[11px] text-[#8A8F76]">
                              {(f.file.size / 1024).toFixed(0)} KB
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeFile(idx)}
                          disabled={uploading}
                          className="flex-shrink-0 p-1 rounded-lg text-[#8A8F76] hover:text-[#B4453D] hover:bg-[#B4453D]/10 transition-colors disabled:opacity-40"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95]">Uploading…</span>
                    <span className="text-xs font-bold text-[#8A8F76]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#3D4127] dark:bg-[#D4DE95] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#8A8F76]">
                    Uploading {validFiles.length} file{validFiles.length !== 1 ? 's' : ''} — do not close this window.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!uploadResult && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1] dark:bg-[#171911]">
            <p className="text-[11px] text-[#8A8F76]">
              {validFiles.length > 0
                ? `${validFiles.length} file${validFiles.length !== 1 ? 's' : ''} ready to upload`
                : 'No valid files selected'}
              {invalidFiles.length > 0 && ` · ${invalidFiles.length} will be skipped`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="apl-btn apl-btn-secondary py-2 px-5 text-xs disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || validFiles.length === 0}
                className="apl-btn apl-btn-primary py-2 px-5 text-xs disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import {validFiles.length > 0 ? `${validFiles.length} Resume${validFiles.length !== 1 ? 's' : ''}` : 'Resumes'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
