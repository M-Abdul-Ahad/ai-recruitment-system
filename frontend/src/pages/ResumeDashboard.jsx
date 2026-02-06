import React, { useState, useRef } from "react";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ResumeDashboard = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [resumeData, setResumeData] = useState(null);

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

  // ⭐ STORE PARSED RESUME DATA
  setResumeData(result.data);

} catch (error) {
  setUploadError(error.message || 'Failed to upload file');
} finally {
  setIsUploading(false);
  event.target.value = '';
}
}

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight">InsightCV</h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">AI Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-slate-700 shadow-sm">Dashboard</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition">History</button>
            </div>

            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
              <button className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
              </button>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold group-hover:text-indigo-600 transition">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Pro Plan</p>
                </div>
                <div className="size-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="avatar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SCORING */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <section className="bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-6xl"></span>
              </div>
              
              <div className="relative flex flex-col items-center">
                <div className="relative size-48">
                  {/* Progress Circle */}
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" className="stroke-slate-100 dark:stroke-slate-800" />
                    <circle cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" strokeDasharray="85, 100" strokeLinecap="round" className="stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                    <span className="text-5xl font-black tracking-tighter">85<span className="text-xl text-slate-400">%</span></span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">ATS Score</span>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
                    Highly Competitive
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Excellent Match</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Your profile ranks in the <span className="text-indigo-500 font-bold font-mono">top 5%</span> for Senior Full-Stack positions.
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex flex-col items-center gap-3 p-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[1.5rem] transition-all shadow-lg shadow-indigo-500/20"
              >
                <span className="material-symbols-outlined">{isUploading ? 'hourglass_top' : 'file_upload'}</span>
                <span className="text-xs font-bold">{isUploading ? 'Uploading...' : 'New Scan'}</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-[1.5rem] transition-all">
                <span className="material-symbols-outlined text-indigo-500">download</span>
                <span className="text-xs font-bold">PDF Report</span>
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
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* FILE STATUS */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {uploadError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                    <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="relative size-16">
                    <svg className="size-full animate-spin" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="2" className="stroke-slate-200 dark:stroke-slate-800" />
                      <circle cx="18" cy="18" r="14" fill="none" strokeWidth="2" strokeDasharray="22, 88" strokeLinecap="round" className="stroke-indigo-500" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Uploading resume...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please wait while we process your file</p>
                  </div>
                </div>
              )}

              {!isUploading && !uploadedFile && (
                <div 
                  onClick={handleUploadClick}
                  className="flex flex-col items-center justify-center py-12 gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors"
                >
                  <div className="size-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-500 text-3xl">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No resume uploaded yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to select PDF or DOCX file</p>
                  </div>
                </div>
              )}

              {!isUploading && uploadedFile && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
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
                      className="px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      Replace
                    </button>
                    <button 
                      onClick={handleRemoveFile}
                      className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ANALYSIS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SKILLS CARDS */}
              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
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
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                  <span className="size-2 bg-amber-500 rounded-full"></span>
                  AI Suggestions
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-lg">lightbulb</span>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      Use <strong>action verbs</strong> like "Architected" instead of "Worked on".
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      Add a dedicated "Certifications" section for Cloud credentials.
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* RAW DATA PREVIEW */}
            <div className="bg-[#0f172a] rounded-[2rem] overflow-hidden border border-slate-800">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Parsed Entity Output</span>
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-500/20"></div>
                  <div className="size-2.5 rounded-full bg-amber-500/20"></div>
                  <div className="size-2.5 rounded-full bg-emerald-500/20"></div>
                </div>
              </div>
              <div className="p-6 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-400" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#000 #0f172a'
              }}>
                {resumeData ? (
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-300">{JSON.stringify(resumeData, null, 2)}</pre>
                ) : (
                  <span className="text-slate-600">// No resume data available</span>
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
    </div>
  );
};

export default ResumeDashboard;