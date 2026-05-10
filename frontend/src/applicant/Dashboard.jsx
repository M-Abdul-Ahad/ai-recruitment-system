import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";

const applicantNav = [
  { label: "Overview", to: "/applicant", end: true },
  { label: "Resume Analysis", to: "/applicant/resume", end: true },
  { label: "Resume Builder", to: "/applicant/builder", end: true },
  { label: "Jobs", to: "/applicant/jobs", end: true },
  { label: "Applications", to: "/applicant/applications", end: true },
];

const cards = [
  ["/applicant/resume", "Resume Analysis", "Upload your resume and receive AI scoring, strengths, and improvement suggestions."],
  ["/applicant/builder", "Resume Builder", "Generate stronger resume content tailored to your target role and skills."],
  ["/applicant/jobs", "Job Discovery", "Browse recommended openings and identify the strongest-fit positions."],
  ["/applicant/applications", "Applications Tracker", "Monitor every application stage with clearer hiring status updates."],
];

export default function Dashboard() {
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
      badge="Applicant workspace"
      title="Track your applications, strengthen your resume, and stay ready for every opportunity."
      subtitle="Your candidate desktop brings together AI review, resume creation, open jobs, and application status in one place."
      navItems={applicantNav}
      stats={[
        { value: "12", label: "Open roles matched to your profile" },
        { value: "87%", label: "Current resume strength score" },
        { value: "4", label: "Applications in progress" },
        { value: "2", label: "Recruiter responses this week" },
      ]}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
                Quick actions
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2.7rem]">
                Candidate cockpit
              </h2>
            </div>
            <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
              Desktop
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {cards.map(([to, title, description]) => (
              <Link
                key={to}
                to={to}
                className="group flex min-h-[240px] flex-col rounded-[28px] border border-white/10 bg-[#111126] p-7 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-[#151432]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[1.7rem] font-semibold leading-[1.15] tracking-tight text-white">{title}</div>
                  <div className="mt-1 size-10 rounded-2xl border border-white/8 bg-white/[0.03] transition group-hover:border-violet-300/20 group-hover:bg-white/[0.05]" />
                </div>
                <p className="mt-5 max-w-[24ch] text-base leading-8 text-slate-400">{description}</p>
                <div className="mt-auto pt-6 text-sm font-medium text-violet-200/80">
                  Open workspace
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,_rgba(20,18,44,0.95),_rgba(14,14,30,0.95))] p-6 md:p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              Profile status
            </div>
            <div className="mt-5 break-all text-[1.95rem] font-semibold leading-[1.15] tracking-tight text-white md:break-normal md:text-[2.15rem]">
              {user?.email}
            </div>
            <p className="mt-2 text-sm capitalize text-slate-400">Role: {user?.role}</p>
            <div className="mt-7 h-2 rounded-full bg-white/8">
              <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
            </div>
            <p className="mt-5 max-w-[34ch] text-base leading-8 text-slate-400">
              Your profile is 72% complete. Improve visibility by refining resume content and applying to more relevant roles.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 md:p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
              Next moves
            </div>
            <div className="mt-5 space-y-4">
              {[
                "Refresh your resume with quantified outcomes.",
                "Apply to two high-match roles this week.",
                "Use AI feedback to close missing skill gaps.",
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/8 bg-black/15 px-5 py-5 text-base leading-8 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
