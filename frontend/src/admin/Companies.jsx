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

const companies = [
  { id: 1, name: "Google", recruiter: "rec@test.com" },
  { id: 2, name: "Amazon", recruiter: "owner@test.com" },
];

export default function Companies() {
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
      badge="Companies"
      title="Oversee employer profiles and ownership structure."
      subtitle="Review company entities and the recruiters responsible for hiring operations."
      navItems={adminNav}
      stats={[
        { value: "02", label: "Sample companies shown" },
        { value: "02", label: "Owners listed" },
        { value: "06", label: "Open roles tied to profiles" },
        { value: "Stable", label: "Configuration status" },
      ]}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="grid grid-cols-3 border-b border-white/10 pb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          <div>ID</div>
          <div>Name</div>
          <div>Owner</div>
        </div>
        <div className="mt-3 space-y-3">
          {companies.map((company) => (
            <div key={company.id} className="grid grid-cols-3 rounded-[24px] border border-white/8 bg-[#111126] px-5 py-5 text-sm text-slate-300">
              <div className="font-medium text-white">{company.id}</div>
              <div>{company.name}</div>
              <div>{company.recruiter}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
