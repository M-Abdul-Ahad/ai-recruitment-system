import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import PortalShell from "../components/PortalShell";

const applicantNav = [
  { label: "Overview", to: "/applicant", end: true },
  { label: "Resume Analysis", to: "/applicant/resume", end: true },
  { label: "Resume Builder", to: "/applicant/builder", end: true },
  { label: "Jobs", to: "/applicant/jobs", end: true },
  { label: "Applications", to: "/applicant/applications", end: true },
];

const applications = [
  ["Sync Squad", "Frontend Developer", "Shortlisted", "Yesterday"],
  ["North Metrics", "Data Analyst", "Reviewing profile", "2 days ago"],
  ["Context Labs", "AI Product Associate", "Submitted", "4 days ago"],
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
            title="Track every application stage without losing momentum across active roles."
            subtitle="Use one applicant workspace to monitor hiring movement, understand what needs follow-up, and see where interviews may open next."
            titleClass="text-2xl md:text-3xl xl:text-4xl"
            navItems={applicantNav}
            stats={[
                { value: "03", label: "Active applications" },
                { value: "01", label: "Interview-ready role" },
                { value: "67%", label: "Average fit score" },
                { value: "05", label: "Saved target companies" },
            ]}
        >
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {[
                    ["Submitted", "02", "Applications awaiting recruiter action"],
                    ["Shortlisted", "01", "Roles with stronger upward momentum"],
                    ["Follow up", "01", "Applications worth checking this week"],
                ].map(([label, value, text]) => (
                    <div key={label} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/70">
                            {label}
                        </div>
                        <div className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</div>
                        <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/70">
                            Pipeline board
                        </div>
                        <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Current application activity</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        Applicant desktop
                    </div>
                </div>

                <div className="mt-5 hidden grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr] gap-4 px-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
                    <div>Company</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Updated</div>
                </div>

                <div className="mt-4 space-y-4">
                    {applications.map(([company, role, status, updated]) => (
                        <div key={company + role} className="grid gap-4 rounded-[24px] border border-white/8 bg-[#111126] px-5 py-5 text-sm text-slate-300 md:grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr] md:items-center">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Company</div>
                                <div className="font-medium text-white">{company}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Role</div>
                                <div>{role}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Status</div>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                    status === "Shortlisted"
                                        ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                                        : status === "Reviewing profile"
                                            ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                                            : "border-white/10 bg-white/8 text-slate-300"
                                }`}>
                                    {status}
                                </span>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:hidden">Updated</div>
                                <div className="text-slate-400">{updated}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PortalShell>
    );
};

export default Applications;
