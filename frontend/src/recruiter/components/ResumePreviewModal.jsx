import React, { useState } from "react";

const API_BASE = "http://localhost:8000";

/**
 * Modal for previewing resume PDFs/DOCXs in-browser.
 * - PDFs: rendered via iframe
 * - DOCX: rendered via Google Docs Viewer iframe
 * - Fallback: download link
 *
 * @param {{ isOpen, onClose, resumeUrl, applicantName }} props
 */
const ResumePreviewModal = ({ isOpen, onClose, resumeUrl, applicantName }) => {
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen || !resumeUrl) return null;

  // Normalize URL — backend returns relative path like /media/resumes/file.pdf
  const fullUrl = resumeUrl.startsWith("http")
    ? resumeUrl
    : `${API_BASE}${resumeUrl}`;

  const isPdf = fullUrl.toLowerCase().endsWith(".pdf");
  const isDocx = fullUrl.toLowerCase().endsWith(".docx");

  // For DOCX, use Google Docs Viewer (works for public URLs)
  // For local dev, we fallback to download link since Google can't access localhost
  const isLocalhost = fullUrl.includes("localhost") || fullUrl.includes("127.0.0.1");
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  const extractFilename = (url) => {
    const parts = url.split("/");
    const raw = parts[parts.length - 1];
    return raw.replace(/_[a-zA-Z0-9]{7,}\./g, ".") || raw;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1]/50 dark:bg-[#171911]/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                <svg className="w-5 h-5 text-[#3D4127]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                  {applicantName ? `${applicantName}'s Resume` : "Resume Preview"}
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] truncate">
                  {extractFilename(fullUrl)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Download button */}
              <a
                href={fullUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-bold text-[#3D4127] dark:text-[#EBF0DA] bg-[#ECEEDF] dark:bg-[#2A2E1E] hover:bg-[#D3D6C4] dark:hover:bg-[#383D28] rounded-lg transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>

              {/* Open in new tab */}
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-bold text-[#3D4127] dark:text-[#EBF0DA] bg-[#ECEEDF] dark:bg-[#2A2E1E] hover:bg-[#D3D6C4] dark:hover:bg-[#383D28] rounded-lg transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open
              </a>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition"
              >
                <svg className="w-5 h-5 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview Body */}
          <div className="flex-1 bg-[#F8F9F1] dark:bg-[#171911] overflow-hidden">
            {isPdf && !iframeError ? (
              <iframe
                src={`${fullUrl}#toolbar=1&navpanes=0`}
                title="Resume PDF Preview"
                className="w-full h-full border-0"
                onError={() => setIframeError(true)}
              />
            ) : isDocx && !isLocalhost && !iframeError ? (
              <iframe
                src={googleViewerUrl}
                title="Resume DOCX Preview"
                className="w-full h-full border-0"
                onError={() => setIframeError(true)}
              />
            ) : (
              /* Fallback */
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#222518] shadow-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA] mb-1">
                    {isDocx ? "DOCX preview not available locally" : "Preview unavailable"}
                  </p>
                  <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mb-4">
                    {isDocx
                      ? "DOCX preview requires a publicly accessible URL. Use download or open in new tab."
                      : "This file type cannot be previewed in the browser."}
                  </p>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4DE95] text-[#3D4127] text-sm font-bold rounded-xl shadow-md hover:bg-[#C6D17E] transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-modal-in { animation: modalIn 0.25s ease-out forwards; }
        `
      }} />
    </>
  );
};

export default ResumePreviewModal;
