import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company", end: true },
  { label: "Jobs Library", to: "/recruiter/jobs", end: true },
  { label: "Create Job", to: "/recruiter/jobs/create", end: true, tag: "AI" },
];

export default function CandidateShortlisting() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);

  const runMatching = () => {
    setResults([
      { id: 1, name: "John Doe", score: 85 },
      { id: 2, name: "Jane Smith", score: 72 },
    ]);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Shortlisting"
      title={`Compare applicants for job ${jobId}.`}
      subtitle="Upload resumes, run a simple AI-style comparison flow, and review ranked candidates from one desktop page."
      navItems={recruiterNav}
      stats={[
        { value: String(resumes.length).padStart(2, "0"), label: "Resumes uploaded" },
        { value: String(results.length).padStart(2, "0"), label: "Ranked candidates" },
        { value: "JD", label: "Comparison source" },
        { value: "Fast", label: "First-pass sorting" },
      ]}
    >
      <div className="grid grid-cols-[0.92fr_1.08fr] gap-8">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <div className="text-xl font-semibold text-white">Upload resumes</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">Attach candidate files and run a shortlist comparison against this role.</p>
          <input type="file" multiple onChange={(e) => setResumes(Array.from(e.target.files))} className="mt-6 block w-full text-sm text-slate-300" />
          <div className="mt-4 text-sm text-slate-400">{resumes.length} file(s) selected</div>
          <button onClick={runMatching} className="mt-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Compare Resumes with JD
          </button>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
          <div className="text-xl font-semibold text-white">Shortlisted candidates</div>
          <div className="mt-5 space-y-4">
            {results.length === 0 ? (
              <div className="rounded-[24px] border border-white/8 bg-black/20 px-5 py-5 text-sm text-slate-400">
                No results yet.
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="flex items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-5 py-5 text-sm">
                  <span className="font-medium text-white">{result.name}</span>
                  <span className="text-cyan-200">Score: {result.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
