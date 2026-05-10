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

const users = [
  { id: 1, email: "user1@test.com", role: "applicant" },
  { id: 2, email: "rec@test.com", role: "recruiter" },
  { id: 3, email: "hr@test.com", role: "recruiter (HR)" },
];

export default function Users() {
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
      badge="Users"
      title="Manage user access with clearer administrative visibility."
      subtitle="Review identities, roles, and platform participation from a single control surface."
      navItems={adminNav}
      stats={[
        { value: "03", label: "Sample users shown" },
        { value: "01", label: "Admin account" },
        { value: "01", label: "HR profile" },
        { value: "Live", label: "Role controls" },
      ]}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
        <div className="grid grid-cols-3 border-b border-white/10 pb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          <div>ID</div>
          <div>Email</div>
          <div>Role</div>
        </div>
        <div className="mt-3 space-y-3">
          {users.map((entry) => (
            <div key={entry.id} className="grid grid-cols-3 rounded-[24px] border border-white/8 bg-[#111126] px-5 py-5 text-sm text-slate-300">
              <div className="font-medium text-white">{entry.id}</div>
              <div>{entry.email}</div>
              <div>{entry.role}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
