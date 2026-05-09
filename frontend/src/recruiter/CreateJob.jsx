import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company" },
  { label: "Jobs Library", to: "/recruiter/jobs" },
  { label: "Create Job", to: "/recruiter/jobs/create", tag: "AI" },
];

export default function CreateJob() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");

  const generateJD = () => {
    setJd(`AI-generated description for ${title || "this role"} with responsibilities, requirements, and success metrics.`);
  };

  const handleSubmit = () => {
    console.log("Creating Job:", { title, jd });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Create job"
      title="Draft a polished role brief before you publish."
      subtitle="Shape the position title, generate a first-pass description, and refine the final posting in a focused desktop workspace."
      navItems={recruiterNav}
      stats={[
        { value: "AI", label: "Description assist available" },
        { value: "15m", label: "Target time to first draft" },
        { value: "01", label: "Current draft" },
        { value: "High", label: "Recruiter control" },
      ]}
    >
      <div className="grid grid-cols-[0.92fr_1.08fr] gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Job title</label>
              <input
                placeholder="Senior Product Designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={generateJD}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/16"
              >
                Generate JD with AI
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Save Job
              </button>
            </div>
          </div>
        </section>
        <section className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
          <label className="mb-2 block text-sm font-medium text-slate-300">Job description</label>
          <textarea
            placeholder="Responsibilities, outcomes, requirements..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows="14"
            className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
          />
        </section>
      </div>
    </PortalShell>
  );
}
