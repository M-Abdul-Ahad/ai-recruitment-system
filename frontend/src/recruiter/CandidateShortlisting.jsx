import { useState } from "react";
import { useParams, Link } from "react-router-dom";

const CandidateShortlisting = () => {
  const { jobId } = useParams();

  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  console.log("PAGE LOADED: Candidate Shortlisting");
  console.log("JOB ID:", jobId);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log("Uploaded Resumes:", files);
    setResumes(files);
  };

  const runMatching = () => {
    console.log("Running AI Matching for job:", jobId);
    setIsAnalyzing(true);

    setTimeout(() => {
      setResults([
        { id: 1, name: "John Doe", score: 85, summary: "Strong experience in React & TypeScript, solid problem solver." },
        { id: 2, name: "Jane Smith", score: 72, summary: "Good full-stack background, moderate match on required core skills." },
      ]);
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="apl-animate-fade max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/recruiter/jobs" className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Jobs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
              AI Candidate Shortlisting
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
              Upload multiple resumes to screen candidates instantly against this job requisition
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/40 apl-font-mono self-start sm:self-auto">
            Job ID: {jobId}
          </span>
        </div>
      </div>

      {/* Grid: Job Context & Resume Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Job Description Overview */}
        <div className="apl-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">Job Description</h3>
            </div>
            <p className="text-xs text-[#52564A] dark:text-[#9CA485] leading-relaxed bg-[#F8F9F1] dark:bg-[#171911] p-4 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E]">
              Targeting candidates with strong full-stack software development experience, expertise in modern JavaScript/React frameworks, RESTful API design, and team collaboration skills.
            </p>
          </div>
          <div className="pt-2 text-xs text-[#8A8F76]">
            Job requirements will be matched automatically during AI execution.
          </div>
        </div>

        {/* Card 2: Upload Resumes */}
        <div className="apl-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#3D4127] text-[#D4DE95] flex items-center justify-center font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              </div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">Upload Resumes</h3>
            </div>
            
            <label className="border-2 border-dashed border-[#D3D6C4] dark:border-[#383D28] hover:border-[#D4DE95] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#F8F9F1]/50 dark:bg-[#171911]/50 transition-colors text-center">
              <svg className="w-8 h-8 text-[#8A8F76] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <span className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">Click to select PDF / Word resumes</span>
              <span className="text-[11px] text-[#8A8F76] mt-1">Select one or multiple files</span>
              <input type="file" multiple onChange={handleUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
            <span className="text-xs font-semibold text-[#52564A] dark:text-[#9CA485]">
              {resumes.length} file(s) selected
            </span>
            <button
              onClick={runMatching}
              disabled={resumes.length === 0 || isAnalyzing}
              className="apl-btn apl-btn-primary py-2 px-5 text-xs shadow-md disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-[#3D4127]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Matching...
                </>
              ) : (
                "Compare Resumes with JD"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="apl-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">Shortlisted Candidates</h2>
            <p className="text-xs text-[#8A8F76]">AI match score breakdown and candidate ranking</p>
          </div>
          {results.length > 0 && (
            <span className="text-xs font-bold px-3 py-1 bg-[#4E7A33]/15 text-[#4E7A33] rounded-full border border-[#4E7A33]/30">
              {results.length} Candidates Screened
            </span>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h4 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] mb-1">No results yet</h4>
            <p className="text-xs text-[#8A8F76]">Upload candidate resumes above and click "Compare Resumes with JD".</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] bg-[#F8F9F1]/50 dark:bg-[#171911]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4DE95] text-[#3D4127] font-extrabold text-sm flex items-center justify-center">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">{r.name}</h4>
                    <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-0.5">{r.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold apl-font-mono bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
                      Score: {r.score}%
                    </span>
                  </div>
                  <Link to={`/recruiter/candidate/${r.id}`} className="apl-btn apl-btn-secondary py-1.5 px-3 text-xs">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateShortlisting;