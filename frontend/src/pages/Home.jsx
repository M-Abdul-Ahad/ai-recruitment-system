import { Link } from "react-router-dom";
import recruitmentBg from "../assets/recruitment-bg.svg";

export default function Home() {
  const features = [
    ["AI Resume Screening", "Rank resumes using structured extraction, fit scoring, and highlight summaries."],
    ["Recruiter Workspace", "Manage company profiles, HR seats, jobs, and applicants from one desktop control panel."],
    ["Candidate Experience", "Give applicants resume analysis, a builder, application tracking, and clear next steps."],
    ["Hiring Analytics", "Surface shortlist quality, candidate flow, time-to-fill, and role performance metrics."],
    ["JD Generation", "Create role briefs, polished descriptions, and skill-based hiring requirements faster."],
    ["Role-Based Security", "Separate applicant, recruiter, and admin experiences with cleaner access control."],
  ];

  const roadmap = [
    ["Applicants", "Career hub, AI resume review, resume builder, applications tracker"],
    ["Recruiters", "Job posting, candidate pipelines, shortlisting, hiring actions"],
    ["Admins", "Platform oversight, users, companies, and operational visibility"],
  ];

  return (
    <div className="min-h-screen bg-[#090814] text-slate-100">
      <div className="marketing-grid">
        <div className="mx-auto max-w-[1500px] px-10 py-10">
          <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/80">
                Nominate AI
              </div>
              <div className="text-lg font-semibold tracking-tight text-white">
                AI Recruitment System
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/8">
                Log in
              </Link>
              <Link to="/signup" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                Sign up
              </Link>
            </div>
          </header>

          <section
            className="relative mt-8 overflow-hidden rounded-[42px] border border-white/10 bg-[#0d0c20] px-10 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(11, 9, 30, 0.78), rgba(12, 10, 26, 0.92)), url(${recruitmentBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="grid grid-cols-[1.15fr_0.85fr] gap-10">
              <div className="py-6">
                <div className="inline-flex rounded-full border border-violet-300/18 bg-violet-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-100">
                  AI-powered recruitment
                </div>
                <h1 className="mt-8 max-w-4xl text-7xl font-semibold leading-[0.95] tracking-tight text-white">
                  Hire smarter.
                  <br />
                  <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                    Move faster.
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                  Automate resume screening, centralize recruiter workflows, and give applicants
                  a polished AI-first experience across the full hiring lifecycle.
                </p>
                <div className="mt-10 flex items-center gap-4">
                  <Link to="/signup" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-4 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(96,80,255,0.35)] transition hover:brightness-110">
                    Launch your workspace
                  </Link>
                  <Link to="/login" className="rounded-full border border-white/12 px-7 py-4 text-sm font-medium text-white transition hover:bg-white/8">
                    Open existing account
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 self-center">
                {[
                  ["10x", "Faster first-pass screening"],
                  ["80%", "Less repetitive recruiter admin"],
                  ["3x", "Better shortlisting quality"],
                  ["24/7", "Always-on applicant support"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[30px] border border-white/10 bg-black/20 px-6 py-6 backdrop-blur-sm">
                    <div className="text-4xl font-semibold tracking-tight text-white">{value}</div>
                    <div className="mt-3 text-sm leading-6 text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[40px] border border-white/10 bg-white/[0.03] px-10 py-10">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/70">
                Platform capabilities
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Everything your hiring team needs
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-400">
                A full recruitment operating system for applicants, recruiters, and admins with a
                sharper desktop-first product experience.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-5">
              {features.map(([title, description]) => (
                <div key={title} className="rounded-[28px] border border-white/10 bg-[#111126] px-6 py-6 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
                  <div className="inline-flex rounded-2xl border border-violet-300/18 bg-violet-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-100">
                    Feature
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid grid-cols-[0.95fr_1.05fr] gap-8">
            <div className="rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,_rgba(21,18,44,0.96),_rgba(12,12,24,0.96))] px-10 py-10">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
                Desktop workflow
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Structured views for every role
              </h2>
              <div className="mt-8 space-y-5">
                {roadmap.map(([title, text]) => (
                  <div key={title} className="rounded-[26px] border border-white/8 bg-white/[0.03] px-6 py-5">
                    <div className="text-lg font-semibold text-white">{title}</div>
                    <div className="mt-2 text-sm leading-7 text-slate-400">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[38px] border border-white/10 bg-[#0f1021] px-10 py-10">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/70">
                    Product focus
                  </div>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                    Built for operational clarity
                  </h2>
                </div>
                <div className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                  Desktop-first
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[30px] border border-white/10">
                <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <div>Area</div>
                  <div>Current focus</div>
                  <div>Impact</div>
                </div>
                {[
                  ["Resume intelligence", "Parsing, AI scoring, and candidate fit signals", "Faster review cycles"],
                  ["Recruiter operations", "Jobs, applicants, and company workflows", "Cleaner handoffs"],
                  ["Role access", "Applicant, recruiter, and admin surfaces", "Less confusion and safer routing"],
                  ["Interface system", "Unified visual language across all screens", "More polished product feel"],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-3 border-b border-white/6 px-6 py-5 text-sm text-slate-300 last:border-b-0">
                    <div className="font-medium text-white">{row[0]}</div>
                    <div className="text-slate-400">{row[1]}</div>
                    <div className="text-cyan-200">{row[2]}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,_rgba(97,72,255,0.15),_rgba(10,11,20,0.92))] px-10 py-10 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-100/70">
              Ready to start
            </div>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
              Transform your hiring flow
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Create an account to start using applicant tools, recruiter pipelines, and admin-level visibility.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-semibold transition hover:bg-slate-100"
                style={{ color: "#0b0a1d" }}
              >
                Create account
              </Link>
              <Link to="/login" className="rounded-full border border-white/12 px-7 py-4 text-sm font-medium text-white transition hover:bg-white/8">
                Log in
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
