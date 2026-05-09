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

const jobs = [
    ["Frontend Developer", "Remote", "92% fit", "React, TypeScript, UI systems"],
    ["Data Analyst", "Karachi", "78% fit", "SQL, BI, dashboard reporting"],
    ["AI Product Associate", "Hybrid", "84% fit", "NLP workflows, documentation, QA"],
];

const Jobs = () => {
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
            title="Review desktop-ready job matches with clearer fit signals."
            subtitle="Prioritize roles based on relevance, required skills, and the hiring context that matters for your profile."
            navItems={applicantNav}
            stats={[
                { value: "24", label: "Open roles this week" },
                { value: "08", label: "High-fit opportunities" },
                { value: "05", label: "Remote-friendly matches" },
                { value: "12", label: "New listings since Monday" },
            ]}
        >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2">
                {jobs.map(([title, location, fit, details]) => (
                    <div key={title} className="flex min-h-[296px] flex-col rounded-[30px] border border-white/10 bg-white/[0.04] p-7">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="max-w-[13ch] text-[2rem] font-semibold leading-[1.15] tracking-tight text-white">{title}</h3>
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                {fit}
                            </span>
                        </div>
                        <div className="mt-6 text-[1.05rem] text-slate-300">{location}</div>
                        <p className="mt-7 max-w-[28ch] text-base leading-8 text-slate-400">{details}</p>
                        <button className="mt-auto inline-flex w-fit rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                            View role
                        </button>
                    </div>
                ))}
            </div>
        </PortalShell>
    );
};

export default Jobs;
