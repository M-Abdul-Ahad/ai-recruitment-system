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

const jobs = [
    ["Frontend Developer", "Remote", "92% fit", "$80k-$110k", "Sync Squad", "React, TypeScript, design systems, product collaboration"],
    ["Data Analyst", "Karachi", "78% fit", "$60k-$85k", "North Metrics", "SQL, BI, reporting automation, stakeholder dashboards"],
    ["AI Product Associate", "Hybrid", "84% fit", "$70k-$95k", "Context Labs", "NLP workflows, documentation, QA, product operations"],
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
            title="Browse stronger-fit roles and move quickly on the opportunities that matter."
            subtitle="Review the most relevant openings, compare fit signals, and keep your application momentum high from one applicant workspace."
            navItems={applicantNav}
            stats={[
                { value: "24", label: "Open roles this week" },
                { value: "08", label: "High-fit opportunities" },
                { value: "05", label: "Remote-friendly matches" },
                { value: "12", label: "New listings since Monday" },
            ]}
        >
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 lg:p-7">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
                        Search focus
                    </div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        Best-fit applicant roles
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                        These sample roles are surfaced around your current profile strength, resume direction, and desktop-first workflow.
                    </p>
                </div>
                <div className="rounded-[30px] border border-white/10 bg-[#111126] p-6 lg:p-7">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                        What to look for
                    </div>
                    <div className="mt-5 space-y-4">
                        {[
                            "Prioritize roles above 80% fit before broad applying.",
                            "Use resume analysis to tailor keywords before sending applications.",
                            "Balance role quality, salary range, and remote flexibility."
                        ].map((item) => (
                            <div key={item} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map(([title, location, fit, salary, company, details]) => (
                    <div key={title} className="flex min-h-[340px] flex-col rounded-[30px] border border-white/10 bg-white/[0.04] p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="max-w-[13ch] text-[2rem] font-semibold leading-[1.15] tracking-tight text-white">{title}</h3>
                                <div className="mt-3 text-sm text-slate-400">{company}</div>
                            </div>
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                {fit}
                            </span>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                            <span className="rounded-full border border-white/8 bg-black/20 px-3 py-2">{location}</span>
                            <span className="rounded-full border border-white/8 bg-black/20 px-3 py-2">{salary}</span>
                        </div>

                        <p className="mt-6 max-w-[30ch] text-base leading-8 text-slate-400">{details}</p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {details.split(", ").slice(0, 3).map((tag) => (
                                <span key={tag} className="rounded-full border border-violet-300/12 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto flex items-center gap-3 pt-8">
                            <button className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]">
                                View Details
                            </button>
                            <button className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PortalShell>
    );
};

export default Jobs;
