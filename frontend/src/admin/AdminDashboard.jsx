import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const adminNav = [
  { label: "Overview", to: "/admin", end: true },
  { label: "Users", to: "/admin/users" },
  { label: "Companies", to: "/admin/companies" },
  { label: "Jobs", to: "/admin/jobs" },
];

export default function AdminDashboard() {
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
      badge="Admin control"
      title="Operate the platform with a cleaner system-wide command view."
      subtitle="Manage users, companies, and jobs from a unified desktop admin experience."
      navItems={adminNav}
      stats={[
        { value: "128", label: "Registered users" },
        { value: "12", label: "Companies" },
        { value: "26", label: "Jobs under review" },
        { value: "99.9%", label: "Platform health target" },
      ]}
    >
      <div className="grid grid-cols-3 gap-6">
        {[
          ["/admin/users", "Users", "Manage applicants, recruiters, and admin identities."],
          ["/admin/companies", "Companies", "Inspect employer profiles, ownership, and team assignments."],
          ["/admin/jobs", "Jobs", "Monitor role inventory, platform activity, and operational quality."],
        ].map(([to, title, text]) => (
          <Link key={to} to={to} className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-0.5 hover:border-violet-400/30">
            <div className="text-2xl font-semibold text-white">{title}</div>
            <p className="mt-4 text-sm leading-7 text-slate-400">{text}</p>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
