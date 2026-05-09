import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import PortalShell from "../components/PortalShell";

const applicantNav = [
  { label: "Overview", to: "/applicant", end: true },
  { label: "Resume Analysis", to: "/applicant/resume" },
  { label: "Resume Builder", to: "/applicant/builder" },
  { label: "Jobs", to: "/applicant/jobs" },
  { label: "Applications", to: "/applicant/applications" },
];

const applications = [
  ["Google", "Product Analyst", "Reviewing profile", "2 days ago"],
  ["Amazon", "Frontend Engineer", "Interview requested", "Yesterday"],
  ["Microsoft", "Platform Associate", "Submitted", "4 days ago"],
];

const Applications = () => {
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
            badge="Applications"
            title="Stay on top of every role you have applied to."
            subtitle="Use one desktop view to understand momentum, waiting points, and the applications that need attention next."
            navItems={applicantNav}
            stats={[
                { value: "03", label: "Active applications" },
                { value: "01", label: "Interview-ready role" },
                { value: "67%", label: "Average fit score" },
                { value: "05", label: "Saved target companies" },
            ]}
        >
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
                <div className="grid grid-cols-4 border-b border-white/10 pb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    <div>Company</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Updated</div>
                </div>
                <div className="mt-3 space-y-3">
                    {applications.map(([company, role, status, updated]) => (
                        <div key={company + role} className="grid grid-cols-4 rounded-[24px] border border-white/8 bg-[#111126] px-5 py-5 text-sm text-slate-300">
                            <div className="font-medium text-white">{company}</div>
                            <div>{role}</div>
                            <div className="text-cyan-200">{status}</div>
                            <div className="text-slate-400">{updated}</div>
                        </div>
                    ))}
                </div>
            </div>
        </PortalShell>
    );
};

export default Applications;
