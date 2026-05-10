import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const adminNav = [
  { label: "Overview", to: "/admin", end: true },
  { label: "Users", to: "/admin/users" },
  { label: "Companies", to: "/admin/companies" },
  { label: "Jobs", to: "/admin/jobs" },
];

const jobs = [
  { id: 1, title: "Frontend Dev", company: "Google" },
  { id: 2, title: "Backend Dev", company: "Amazon" },
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
      badge="Jobs"
      title="Monitor platform-wide job activity from the admin layer."
      subtitle="Review role coverage, company association, and the jobs currently visible across the system."
      navItems={adminNav}
      stats={[
        { value: "02", label: "Sample jobs shown" },
        { value: "02", label: "Companies represented" },
        { value: "Active", label: "Inventory status" },
        { value: "Core", label: "Operational view" },
      ]}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="grid grid-cols-3 border-b border-white/10 pb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          <div>ID</div>
          <div>Title</div>
          <div>Company</div>
        </div>
        <div className="mt-3 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="grid grid-cols-3 rounded-[24px] border border-white/8 bg-[#111126] px-5 py-5 text-sm text-slate-300">
              <div className="font-medium text-white">{job.id}</div>
              <div>{job.title}</div>
              <div>{job.company}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
