import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company" },
  { label: "Jobs Library", to: "/recruiter/jobs" },
  { label: "Create Job", to: "/recruiter/jobs/create", tag: "AI" },
];

const sampleJobs = [
  { id: 1, title: "Frontend Developer" },
  { id: 2, title: "Backend Engineer" },
];

export default function Jobs() {
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
      badge="Jobs library"
      title="Review your recruiting inventory with a cleaner jobs view."
      subtitle="Use this page to browse roles, jump into creation, and move between active requisitions faster."
      navItems={recruiterNav}
      stats={[
        { value: "02", label: "Visible sample jobs" },
        { value: "01", label: "Draft role templates" },
        { value: "04", label: "Priority requisitions" },
        { value: "36h", label: "Average publish time" },
      ]}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-semibold text-white">All jobs</div>
          <Link to="/recruiter/jobs/create" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Create Job
          </Link>
        </div>
        <div className="space-y-4">
          {sampleJobs.map((job) => (
            <Link key={job.id} to={`/recruiter/jobs/${job.id}`} className="flex items-center justify-between rounded-[24px] border border-white/8 bg-[#111126] px-6 py-5 text-sm transition hover:border-violet-400/30">
              <span className="font-medium text-white">{job.title}</span>
              <span className="text-slate-400">Open details</span>
            </Link>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
