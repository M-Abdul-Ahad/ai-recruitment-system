import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const applicantNav = [
  { label: "Overview", to: "/applicant", end: true },
  { label: "Resume Analysis", to: "/applicant/resume", end: true },
  { label: "Resume Builder", to: "/applicant/builder", end: true },
  { label: "Jobs", to: "/applicant/jobs", end: true },
  { label: "Applications", to: "/applicant/applications", end: true },
];


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const parseErrorResponse = async (response, fallbackMessage) => {
  const errorText = await response.text();

  try {
    const errorData = JSON.parse(errorText);
    return errorData.error || fallbackMessage;
  } catch {
    return errorText || fallbackMessage;
  }
};

const ResumeAnalysis = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiError, setAiError] = useState(null);

  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type by extension and MIME type
    const validExtensions = ['.pdf', '.docx'];
    const validMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const isValidMimeType = validMimeTypes.includes(file.type);

    if (!isValidExtension && !isValidMimeType) {
      setUploadError('Only PDF and DOCX files are allowed');
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${API_URL}/api/resumes/upload/`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response, 'Upload failed');
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setUploadedFile({
        id: result.data.id,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        uploadDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });

      // ⭐ STORE PARSED RESUME DATA
      setResumeData(result.data);

      // 🔥 AUTO-GENERATE AI FEEDBACK AFTER UPLOAD
      await generateAIFeedback(result.data.id);

    } catch (error) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setAiFeedback(null);
    setAiError(null);
  };

  const generateAIFeedback = async (resumeId = null) => {
    const aiResumeId = resumeId || uploadedFile?.id;

    if (!aiResumeId) {
      setAiError('Please upload a resume first');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/resumes/ai-feedback/${aiResumeId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // ❌ NO AUTH HEADER
          }
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response, 'Failed to generate AI feedback');
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setAiFeedback(result.data);
    } catch (error) {
      setAiError(error.message || 'Failed to generate AI feedback');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Resume Analysis"
      title="Analyze your resume with AI and improve how you present your experience."
      subtitle="Upload your resume, review scoring and suggestions, and inspect the parsed output without leaving the applicant workspace."
      titleClass="text-2xl md:text-3xl xl:text-4xl"
      navItems={applicantNav}
      stats={[
        { value: aiFeedback ? `${aiFeedback.score || 0}%` : "--", label: "Current AI score" },
        { value: uploadedFile ? "01" : "00", label: "Resume uploaded" },
        { value: resumeData?.skills?.length ? String(resumeData.skills.length).padStart(2, "0") : "00", label: "Skills detected" },
        { value: aiFeedback ? "Ready" : "Pending", label: "Feedback status" },
      ]}
    >
      <main className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-12 gap-6 xl:gap-8">

          {/* LEFT COLUMN: SCORING */}
          <div className="col-span-12 space-y-6 xl:col-span-4">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-sm">
              <div className="absolute top-0 right-0 p-6">
                <span className="material-symbols-outlined text-white/10 text-6xl"></span>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative size-44">
                  {/* Progress Circle */}
                  <svg className="size-full rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      strokeWidth="2.5"
                      className="stroke-white/10"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      strokeWidth="2.5"
                      strokeDasharray={aiFeedback ? `${Math.min(aiFeedback.score || 0, 100)}, 100` : "0, 100"}
                      strokeLinecap="round"
                      className={aiFeedback
                        ? "stroke-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                        : "stroke-white/20 drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]"}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tracking-tighter">
                      {aiFeedback ? aiFeedback.score || 0 : '--'}
                      <span className="text-xl text-slate-400">
                        {aiFeedback ? '%' : ''}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                      AI Score
                    </span>
                  </div>
                </div>

                <div className="mt-7 max-w-sm text-center">
                  {aiFeedback ? (
                    <>
                      <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-3 ${aiFeedback.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                        aiFeedback.score >= 60 ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                        {aiFeedback.score >= 80 ? 'Excellent' : aiFeedback.score >= 60 ? 'Good' : 'Needs Work'}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">Resume Analysis Complete</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {aiFeedback.score >= 80 ? 'Your resume is well-optimized and highly competitive.' :
                          aiFeedback.score >= 60 ? 'Your resume has good structure. Review suggestions to improve further.' :
                            'Follow the AI suggestions below to strengthen your resume.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-slate-400 text-xs font-bold mb-3">
                        Ready for Analysis
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">Upload Your Resume</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        Upload and get instant AI-powered feedback on your resume quality and suggestions for improvement.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex min-h-[128px] flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined">{isUploading ? 'hourglass_top' : 'file_upload'}</span>
                <span className="text-xs font-bold">{isUploading ? 'Uploading...' : 'New Scan'}</span>
              </button>
              <button
                onClick={generateAIFeedback}
                disabled={aiLoading || !uploadedFile}
                className="flex min-h-[128px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 transition-all hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-indigo-500">{aiLoading ? 'hourglass_top' : 'sparkles'}</span>
                <span className="text-xs font-bold">{aiLoading ? 'Analyzing...' : 'AI Analysis'}</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* RIGHT COLUMN: ANALYSIS */}
          <div className="col-span-12 space-y-6 xl:col-span-8">

            {/* FILE STATUS */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-sm">
              {uploadError && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                    <p className="text-sm text-red-400">{uploadError}</p>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="relative size-16">
                    <svg className="size-full animate-spin" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="2" className="stroke-white/10" />
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="2" strokeDasharray="22, 88" strokeLinecap="round" className="stroke-indigo-500" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-300">Uploading resume...</p>
                    <p className="text-xs text-slate-400 mt-1">Please wait while we process your file</p>
                  </div>
                </div>
              )}

              {!isUploading && !uploadedFile && (
                <div
                  onClick={handleUploadClick}
                  className="flex min-h-[248px] flex-col items-center justify-center gap-5 rounded-[1.5rem] py-12 text-center transition-colors hover:bg-white/5"
                >
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-300">No resume uploaded yet</p>
                    <p className="mt-2 text-xs text-slate-400">Click to select PDF or DOCX file</p>
                  </div>
                </div>
              )}

              {!isUploading && uploadedFile && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-500">
                        {uploadedFile.name.endsWith('.pdf') ? '' : 'description'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight line-clamp-1">{uploadedFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Uploaded {uploadedFile.uploadDate} • {uploadedFile.size} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUploadClick}
                      className="px-5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl transition"
                    >
                      Replace
                    </button>
                    <button
                      onClick={handleRemoveFile}
                      className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI FEEDBACK ERROR */}
            {aiError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                  <p className="text-sm text-red-400">{aiError}</p>
                </div>
              </div>
            )}

            {/* ANALYSIS GRID */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* SKILLS CARDS */}
              <div className="min-h-[320px] rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                  <span className="size-2 bg-indigo-500 rounded-full"></span>
                  Key Skill Gaps
                </h4>
                <div className="space-y-3">
                  {resumeData?.skills?.length ? (
                    resumeData.skills.map((skill, index) => (
                      <div key={index} className="group">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="capitalize">{skill.name || skill}</span>
                          <span className="text-indigo-500">✓</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-full"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills detected</p>
                  )}
                </div>
              </div>

              {/* IMPROVEMENTS */}
              <div className="min-h-[320px] rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                  <span className="size-2 bg-amber-500 rounded-full"></span>
                  AI Suggestions
                </h4>
                {aiFeedback?.suggestions ? (
                  <div className="space-y-3">
                    {Array.isArray(aiFeedback.suggestions) ? (
                      aiFeedback.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex gap-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition">
                          <div className="flex-shrink-0">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                            {suggestion}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                            1
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                          {aiFeedback.suggestions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                          1
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                        Use <strong>action verbs</strong> like "Architected" instead of "Worked on".
                      </p>
                    </div>
                    <div className="flex gap-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <div className="flex-shrink-0">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                          2
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                        Add a dedicated "Certifications" section for Cloud credentials.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI FEEDBACK RESULTS */}
            {aiFeedback && (
              <div className="space-y-6">

                {/* STRENGTHS */}
                {aiFeedback.strengths && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">
                      <span className="material-symbols-outlined">check_circle</span>
                      Strengths
                    </h4>
                    {Array.isArray(aiFeedback.strengths) ? (
                      <div className="space-y-3">
                        {aiFeedback.strengths.map((strength, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-white/[0.04] rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition">
                            <div className="flex-shrink-0">
                              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                              {strength}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 p-4 bg-white/[0.04] rounded-lg border border-emerald-500/20">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                          {aiFeedback.strengths}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* WEAKNESSES */}
                {aiFeedback.weaknesses && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-400 mb-4">
                      <span className="material-symbols-outlined">warning</span>
                      Areas to Improve
                    </h4>
                    {Array.isArray(aiFeedback.weaknesses) ? (
                      <div className="space-y-3">
                        {aiFeedback.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-white/[0.04] rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition">
                            <div className="flex-shrink-0">
                              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                              {weakness}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 p-4 bg-white/[0.04] rounded-lg border border-amber-500/20">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold">
                            1
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300 pt-0.5">
                          {aiFeedback.weaknesses}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* RECOMMENDED CERTIFICATIONS */}
                {aiFeedback.recommended_certifications && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-400 mb-4">
                      <span className="material-symbols-outlined"></span>
                      Recommended Certifications
                    </h4>
                    {Array.isArray(aiFeedback.recommended_certifications) ? (
                      <div className="space-y-3">
                        {aiFeedback.recommended_certifications.map((cert, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-white/[0.04] rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition">
                            <div className="flex-shrink-0">
                              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-500/20 text-blue-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-slate-200">{cert.name}</h5>
                              <p className="text-xs text-slate-400 mt-1">{cert.reason}</p>
                              <div className="flex gap-3 mt-2 text-[11px] text-slate-400">
                                {cert.platform && <span className="bg-white/10 px-2 py-1 rounded">{cert.platform}</span>}
                                {cert.estimated_duration && <span className="bg-white/10 px-2 py-1 rounded">{cert.estimated_duration}</span>}
                                {cert.difficulty && <span className="bg-white/10 px-2 py-1 rounded">{cert.difficulty}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* RAW DATA PREVIEW */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-xl">
              <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50 backdrop-blur">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">{aiFeedback ? 'AI Feedback Output' : 'Parsed Entity Output'}</span>
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-500/40 animate-pulse"></div>
                  <div className="size-2.5 rounded-full bg-amber-500/40 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                  <div className="size-2.5 rounded-full bg-emerald-500/40 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
              <div className="p-6 h-72 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#475569 #1e293b'
              }}>
                {aiFeedback || resumeData ? (
                  <pre className="whitespace-pre-wrap text-sm font-light tracking-wide">
                    {JSON.stringify(aiFeedback || resumeData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-500 italic flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    No resume data available yet
                  </div>
                )}
              </div>
            </div>

            <style>{`
              .black-scrollbar::-webkit-scrollbar {
                width: 8px;
              }

              .black-scrollbar::-webkit-scrollbar-track {
                background: #0f172a;
              }

              .black-scrollbar::-webkit-scrollbar-thumb {
                background-color: #000;
                border-radius: 10px;
              }

              .black-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #111;
              }
            `}</style>

          </div>
        </div>
      </main>
    </PortalShell>
  );
};

export default ResumeAnalysis;
