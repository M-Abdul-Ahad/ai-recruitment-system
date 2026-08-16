import { Link, useParams } from "react";

const CandidateDetail = () => {
  const { id } = useParams();
  console.log("PAGE LOADED: Candidate Detail", id);

  return (
    <div className="apl-animate-fade max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link to="/recruiter/candidates" className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Candidates
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">Candidate Profile</h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">Detailed evaluation & AI matching insights for candidate #{id || "1"}</p>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="apl-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4DE95] text-[#3D4127] font-extrabold text-2xl flex items-center justify-center shadow-sm border border-[#3D4127]/10">
            J
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA]">John Doe</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3E7285]/10 text-[#3E7285] border border-[#3E7285]/20">
                Applied
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485] mt-1">
              john.doe@example.com • Applied 3 days ago
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 bg-[#F8F9F1] dark:bg-[#171911] px-5 py-3 rounded-2xl border border-[#ECEEDF] dark:border-[#2A2E1E]">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8A8F76] block">Match Score</span>
            <span className="text-2xl font-extrabold text-[#4E7A33] apl-font-mono">85%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4E7A33]/15 text-[#4E7A33] flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="apl-card space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#3D4127] text-[#D4DE95] flex items-center justify-center font-bold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">AI Match Insights</h3>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#ECEEDF] dark:border-[#2A2E1E] space-y-3">
          <p className="text-sm font-semibold text-[#3D4127] dark:text-[#D4DE95]">
            Strong in React, TypeScript, and modern UI architectures. Lacks deep backend experience.
          </p>
          
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
              <span>Frontend Competency</span>
              <span className="apl-font-mono">92%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] overflow-hidden">
              <div className="h-full bg-[#D4DE95] rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="apl-card flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-semibold text-[#8A8F76]">Take recruiter action on candidate</span>
        <div className="flex items-center gap-3">
          <button className="apl-btn apl-btn-primary shadow-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            Shortlist
          </button>
          <button className="apl-btn apl-btn-dark shadow-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;