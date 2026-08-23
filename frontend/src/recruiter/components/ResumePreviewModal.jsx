import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const API_BASE = "http://localhost:8000";

/**
 * Modal for previewing resume PDFs and DOCXs in-browser securely.
 * - Authenticated Blob Fetching: Uses Axios with Bearer JWT token to fetch resume file bytes.
 * - PDFs: Rendered in-browser via blob URL in iframe/object.
 * - DOCX: Shows document info + direct download/open + Extracted Text tab (if text available).
 * - Security: Preserves JWT authentication; blob URLs are scoped to the local session.
 *
 * @param {{ isOpen, onClose, resumeUrl, applicantName, resumeText }} props
 */
const ResumePreviewModal = ({ isOpen, onClose, resumeUrl, applicantName, resumeText }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'text'

  useEffect(() => {
    let createdUrl = null;

    if (isOpen && resumeUrl) {
      setLoading(true);
      setFetchError(null);
      setBlobUrl(null);
      setActiveTab("preview");

      const fullUrl = resumeUrl.startsWith("http")
        ? resumeUrl
        : `${API_BASE}${resumeUrl.startsWith("/") ? "" : "/"}${resumeUrl}`;

      // Fetch file with JWT auth via Axios
      api
        .get(fullUrl, { responseType: "blob" })
        .then((res) => {
          const isPdfFile = fullUrl.toLowerCase().endsWith(".pdf");
          const contentType = res.headers["content-type"] || (isPdfFile ? "application/pdf" : "application/octet-stream");
          const blob = new Blob([res.data], { type: contentType });
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
        })
        .catch((err) => {
          console.error("Error loading resume blob:", err);
          setFetchError(
            err.response?.data?.error ||
              "Could not stream preview from server. You can still download or open the file."
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, resumeUrl]);

  if (!isOpen || !resumeUrl) return null;

  const fullUrl = resumeUrl.startsWith("http")
    ? resumeUrl
    : `${API_BASE}${resumeUrl.startsWith("/") ? "" : "/"}${resumeUrl}`;

  const isPdf = fullUrl.toLowerCase().endsWith(".pdf");
  const isDocx = fullUrl.toLowerCase().endsWith(".docx");

  const extractFilename = (url) => {
    try {
      const parts = url.split("/");
      const raw = parts[parts.length - 1];
      return decodeURIComponent(raw.replace(/_[a-zA-Z0-9]{7,}\./g, ".")) || raw;
    } catch {
      return "resume_document";
    }
  };

  const filename = extractFilename(fullUrl);

  const handleDownload = () => {
    const targetUrl = blobUrl || fullUrl;
    const a = document.createElement("a");
    a.href = targetUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
    } else {
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#22241B]/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="bg-white dark:bg-[#222518] rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden border border-[#D3D6C4] dark:border-[#383D28] animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1]/80 dark:bg-[#171911]/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4DE95]/30 text-[#3D4127] dark:text-[#D4DE95] flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
                  {applicantName ? `${applicantName}'s Resume` : "Resume Preview"}
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] truncate flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold">{filename}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E]">
                    {isPdf ? "PDF" : isDocx ? "DOCX" : "DOC"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Tab Selector if text is available or for DOCX */}
              {(isDocx || resumeText) && (
                <div className="flex bg-[#ECEEDF] dark:bg-[#2A2E1E] p-1 rounded-xl mr-2">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === "preview"
                        ? "bg-white dark:bg-[#1D2015] text-[#3D4127] dark:text-[#D4DE95] shadow-xs"
                        : "text-[#8A8F76] hover:text-[#22241B]"
                    }`}
                  >
                    Document Preview
                  </button>
                  {resumeText && (
                    <button
                      onClick={() => setActiveTab("text")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        activeTab === "text"
                          ? "bg-white dark:bg-[#1D2015] text-[#3D4127] dark:text-[#D4DE95] shadow-xs"
                          : "text-[#8A8F76] hover:text-[#22241B]"
                      }`}
                    >
                      Extracted Text
                    </button>
                  )}
                </div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 text-xs font-bold text-[#3D4127] dark:text-[#EBF0DA] bg-[#ECEEDF] dark:bg-[#2A2E1E] hover:bg-[#D3D6C4] dark:hover:bg-[#383D28] rounded-xl transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>

              {/* Open in new tab */}
              <button
                onClick={handleOpenInNewTab}
                className="px-3.5 py-2 text-xs font-bold text-[#3D4127] dark:text-[#EBF0DA] bg-[#ECEEDF] dark:bg-[#2A2E1E] hover:bg-[#D3D6C4] dark:hover:bg-[#383D28] rounded-xl transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Tab
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview Content Body */}
          <div className="flex-1 bg-[#F8F9F1] dark:bg-[#171911] overflow-hidden relative flex flex-col">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <svg className="w-8 h-8 animate-spin text-[#3D4127] dark:text-[#D4DE95]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                <p className="text-xs font-bold text-[#8A8F76]">Streaming resume file securely…</p>
              </div>
            ) : activeTab === "text" && resumeText ? (
              /* Extracted Text View */
              <div className="p-6 overflow-y-auto h-full font-mono text-xs text-[#22241B] dark:text-[#EBF0DA] whitespace-pre-wrap leading-relaxed bg-white dark:bg-[#1D2015] border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
                {resumeText}
              </div>
            ) : isPdf && blobUrl ? (
              /* PDF rendering inside iframe/object using secure Blob URL */
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full border-0"
              >
                <iframe
                  src={blobUrl}
                  title="Resume PDF Preview"
                  className="w-full h-full border-0"
                />
              </object>
            ) : isDocx ? (
              /* DOCX Fallback / Overview */
              <div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#3E7285]/15 text-[#3E7285] flex items-center justify-center mb-4 shadow-xs">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-1">
                  Microsoft Word Document (.docx)
                </h4>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mb-6 leading-relaxed">
                  Browser native inline rendering is optimized for PDF files. You can download the DOCX file directly or open it in a new tab.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="apl-btn apl-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download DOCX
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="apl-btn apl-btn-secondary py-2.5 px-5 text-xs flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback for error or non-previewable formats */
              <div className="flex flex-col items-center justify-center h-full p-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#B4453D]/10 text-[#B4453D] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-1">
                  Preview Notice
                </h4>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mb-6">
                  {fetchError || "This document can be accessed using download or open options below."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="apl-btn apl-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download File
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="apl-btn apl-btn-secondary py-2.5 px-5 text-xs flex items-center gap-2"
                  >
                    Open in New Tab
                  </button>
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
