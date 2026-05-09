import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company" },
  { label: "Jobs Library", to: "/recruiter/jobs" },
  { label: "Create Job", to: "/recruiter/jobs/create", tag: "AI" },
];

export default function CandidateDetail() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Candidate detail"
      title="Review candidate signals before you shortlist."
      subtitle="See fit score, core strengths, and key gaps in a more polished recruiter analysis view."
      navItems={recruiterNav}
      stats={[
        { value: "85", label: "Fit score" },
        { value: "04", label: "Matched skills" },
        { value: "01", label: "Primary gap" },
        { value: "Fast", label: "Review speed" },
      ]}
    >
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-8">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <div className="text-3xl font-semibold text-white">John Doe</div>
          <div className="mt-3 text-sm text-slate-400">Candidate score: 85</div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
          <div className="text-xl font-semibold text-white">AI insights</div>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Strong in React, dashboard development, and UI execution. Needs deeper backend exposure for full-stack roles.
          </p>
          <div className="mt-6 flex gap-3">
            <button className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
              Shortlist
            </button>
            <button className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/8">
              Send Email
            </button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
