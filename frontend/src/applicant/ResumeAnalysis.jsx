import React, { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ResumeAnalysis = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiError, setAiError] = useState(null);

  const fileInputRef = useRef(null);

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

    // Validate file size (max 10MB)
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
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

      setResumeData(result.data);
      await generateAIFeedback(result.data.id);

    } catch (error) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setAiFeedback(null);
    setAiError(null);
    setResumeData(null);
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
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI feedback');
      }

      const result = await response.json();
      setAiFeedback(result.data);
    } catch (error) {
      setAiError(error.message || 'Failed to generate AI feedback');
    } finally {
      setAiLoading(false);
    }
  };

  const score = aiFeedback?.score || 0;

  return (
    <div className="apl-animate-fade space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D3D6C4] dark:border-[#383D28] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
            AI Analytics & Feedback
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
            Resume Analysis
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="apl-btn apl-btn-primary shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>{isUploading ? 'Uploading...' : 'Upload Resume'}</span>
          </button>
          {uploadedFile && (
            <button
              onClick={() => generateAIFeedback()}
              disabled={aiLoading}
              className="apl-btn apl-btn-dark shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{aiLoading ? 'Analyzing...' : 'Re-Scan AI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: SCORE & UPLOAD CARD */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI SCORE GAUGE CARD */}
          <div className="apl-card flex flex-col items-center text-center relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485] mb-6">
              AI Resume Match Score
            </span>

            {/* CIRCULAR SCORE BAR - DESIGN.md (#D4DE95 fill stroke with #3D4127 percentage label) */}
            <div className="relative w-44 h-44 my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-[#ECEEDF] dark:stroke-[#2A2E1E]"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="3.2"
                  strokeDasharray={aiFeedback ? `${Math.min(score, 100)}, 100` : "0, 100"}
                  strokeLinecap="round"
                  className={aiFeedback ? "stroke-[#D4DE95] transition-all duration-1000" : "stroke-[#D3D6C4]"}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold apl-font-mono text-[#3D4127] dark:text-[#EBF0DA] tracking-tight">
                  {aiFeedback ? score : '--'}
                  <span className="text-xl text-[#8A8F76]">
                    {aiFeedback ? '%' : ''}
                  </span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8A8F76] mt-1">
                  Score
                </span>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="mt-4">
              {aiFeedback ? (
                <>
                  <span className={`apl-pill text-xs ${
                    score >= 80
                      ? 'apl-pill-success'
                      : score >= 60
                      ? 'apl-pill-warning'
                      : 'apl-pill-danger'
                  }`}>
                    {score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Weak Match'}
                  </span>
                  <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-3 leading-relaxed">
                    {score >= 80
                      ? 'Your resume is highly optimized and competitive for target roles.'
                      : score >= 60
                      ? 'Solid foundation. Review the AI suggestions to boost keywords.'
                      : 'Follow the recommendations below to strengthen core skills and formatting.'}
                  </p>
                </>
              ) : (
                <>
                  <span className="apl-pill apl-pill-accent">Ready for Scan</span>
                  <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-3 leading-relaxed">
                    Upload your PDF or DOCX resume to extract data and trigger instant AI analytics.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* FILE SELECTION STATUS CARD */}
          <div className="apl-card">
            {uploadError && (
              <div className="p-4 mb-4 rounded-lg bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] text-xs font-semibold flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{uploadError}</span>
              </div>
            )}

            {isUploading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-[#D4DE95] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">Processing file & running AI parsing...</p>
              </div>
            ) : !uploadedFile ? (
              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-[#D3D6C4] dark:border-[#383D28] hover:border-[#636B2F] dark:hover:border-[#D4DE95] rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#F8F9F1]/50 dark:bg-[#171911]/50 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#D4DE95] text-[#3D4127] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">Click to upload resume</p>
                <p className="text-xs text-[#8A8F76] mt-1">Supports PDF or DOCX (Max 10MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9F1] dark:bg-[#2A2E1E] border border-[#D3D6C4] dark:border-[#383D28]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-[#D4DE95] text-[#3D4127] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {uploadedFile.name.endsWith('.pdf') ? 'PDF' : 'DOC'}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">{uploadedFile.name}</p>
                      <p className="text-[10px] text-[#8A8F76]">Uploaded {uploadedFile.uploadDate} • {uploadedFile.size} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded text-[#B4453D] hover:bg-[#B4453D]/10 transition"
                    title="Remove File"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUploadClick}
                    className="apl-btn apl-btn-secondary text-xs flex-1"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => generateAIFeedback()}
                    disabled={aiLoading}
                    className="apl-btn apl-btn-primary text-xs flex-1"
                  >
                    {aiLoading ? 'Scanning...' : 'Scan Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI FEEDBACK DETAILS */}
        <div className="lg:col-span-8 space-y-6">

          {/* AI ERROR NOTIFICATION */}
          {aiError && (
            <div className="p-4 rounded-xl bg-[#B4453D]/10 border border-[#B4453D]/30 text-[#B4453D] text-xs font-semibold flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{aiError}</span>
            </div>
          )}

          {/* SKILLS & SUGGESTIONS DUAL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* KEY SKILLS DETECTED */}
            <div className="apl-card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#636B2F]" />
                Detected Skills & Gaps
              </h3>

              <div className="space-y-3">
                {resumeData?.skills?.length ? (
                  resumeData.skills.map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                        <span className="capitalize">{skill.name || skill}</span>
                        <span className="text-[#4E7A33]">✓</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4DE95] rounded-full w-full" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8A8F76] italic">No skill tags extracted yet</p>
                )}
              </div>
            </div>

            {/* AI SUGGESTIONS */}
            <div className="apl-card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C99A3E]" />
                AI Optimization Suggestions
              </h3>

              <div className="space-y-3">
                {aiFeedback?.suggestions ? (
                  Array.isArray(aiFeedback.suggestions) ? (
                    aiFeedback.suggestions.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-lg bg-[#C99A3E]/10 border border-[#C99A3E]/20 text-xs">
                        <span className="font-extrabold text-[#C99A3E]">{idx + 1}.</span>
                        <span className="text-[#22241B] dark:text-[#EBF0DA] leading-relaxed">{item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 p-3 rounded-lg bg-[#C99A3E]/10 border border-[#C99A3E]/20 text-xs">
                      <span className="font-extrabold text-[#C99A3E]">1.</span>
                      <span className="text-[#22241B] dark:text-[#EBF0DA] leading-relaxed">{aiFeedback.suggestions}</span>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-[#F8F9F1] dark:bg-[#2A2E1E] text-xs text-[#52564A] dark:text-[#9CA485]">
                      Use metric-driven action verbs (e.g. "Increased throughput by 40%").
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8F9F1] dark:bg-[#2A2E1E] text-xs text-[#52564A] dark:text-[#9CA485]">
                      Ensure contact info and LinkedIn profile links are clearly formatted.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          {aiFeedback && (
            <div className="space-y-6">
              {aiFeedback.strengths && (
                <div className="apl-card border-l-4 border-l-[#4E7A33]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#4E7A33] mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Core Strengths
                  </h4>
                  {Array.isArray(aiFeedback.strengths) ? (
                    <div className="space-y-2">
                      {aiFeedback.strengths.map((str, i) => (
                        <div key={i} className="text-xs text-[#22241B] dark:text-[#EBF0DA] p-2.5 rounded bg-[#4E7A33]/10">
                          {str}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#22241B] dark:text-[#EBF0DA] p-2.5 rounded bg-[#4E7A33]/10">{aiFeedback.strengths}</p>
                  )}
                </div>
              )}

              {aiFeedback.weaknesses && (
                <div className="apl-card border-l-4 border-l-[#C99A3E]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#C99A3E] mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Areas for Improvement
                  </h4>
                  {Array.isArray(aiFeedback.weaknesses) ? (
                    <div className="space-y-2">
                      {aiFeedback.weaknesses.map((wk, i) => (
                        <div key={i} className="text-xs text-[#22241B] dark:text-[#EBF0DA] p-2.5 rounded bg-[#C99A3E]/10">
                          {wk}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#22241B] dark:text-[#EBF0DA] p-2.5 rounded bg-[#C99A3E]/10">{aiFeedback.weaknesses}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RAW ENTITY PREVIEW */}
          <div className="apl-card bg-[#22241B] text-[#EBF0DA] overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-[#383D28] mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#BAC095] apl-font-mono">
                {aiFeedback ? 'AI Output Stream' : 'Extracted Resume Schema'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4DE95] animate-pulse" />
            </div>

            <div className="max-h-64 overflow-y-auto apl-font-mono text-xs leading-relaxed">
              {aiFeedback || resumeData ? (
                <pre className="whitespace-pre-wrap text-[#D4DE95]">
                  {JSON.stringify(aiFeedback || resumeData, null, 2)}
                </pre>
              ) : (
                <span className="text-[#8A8F76] italic">No active telemetry payload yet. Upload resume to inspect structured data.</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;