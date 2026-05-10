import { Link } from "react-router-dom";
import recruitmentBg from "../assets/recruitment-bg.svg";

export default function AuthLayout({ title, subtitle, eyebrow, children, footer }) {
  return (
    <div className="min-h-screen bg-[#090814] px-10 py-8 text-slate-100">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[1.2fr_0.88fr] overflow-hidden rounded-[40px] border border-white/10 bg-[#0e0d1f] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <section
          className="relative overflow-hidden border-r border-white/8 px-12 py-12"
          style={{
            backgroundImage: `linear-gradient(140deg, rgba(12, 10, 30, 0.82), rgba(11, 9, 28, 0.95)), url(${recruitmentBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 flex h-full min-h-[820px] flex-col justify-between gap-16">
            <Link to="/" className="inline-flex w-fit items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-100 transition hover:bg-white/10">
              RecuroAI
            </Link>
            <div className="max-w-xl rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-200/70">
                Project Snapshot
              </div>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                One system for applicants, recruiters, and admins.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                This AI recruitment project streamlines hiring with resume analysis,
                job posting, candidate shortlisting, application tracking, and role-based dashboards.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["AI", "Resume feedback"],
                  ["RBAC", "Secure access"],
                  ["Flow", "Hiring pipeline"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-4">
                    <div className="text-lg font-semibold text-white">{value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                AI Recruitment Platform
              </div>
              <h2 className="text-6xl font-semibold leading-[0.98] tracking-tight text-white">
                Hire smarter.
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  Move faster.
                </span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                A desktop-first hiring workspace for candidate screening, resume intelligence,
                recruiter collaboration, and role-based operations.
              </p>
              <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
                {[
                  ["10x", "Faster screening decisions"],
                  ["24/7", "AI support for resumes and job content"],
                  ["80%", "Less admin-heavy manual work"],
                  ["3x", "Better shortlisting quality"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[24px] border border-white/10 bg-black/18 px-5 py-5 backdrop-blur-sm">
                    <div className="text-3xl font-semibold text-white">{value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-start justify-center bg-[radial-gradient(circle_at_top,_rgba(125,95,255,0.18),_transparent_34%),linear-gradient(180deg,_#121126_0%,_#0d0c1a_100%)] px-10 py-12">
          <div className="w-full max-w-[470px]">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-[0.34em] text-violet-200/75">
                {eyebrow}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="mt-3 text-base leading-7 text-slate-400">{subtitle}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              {children}
            </div>
            {footer ? <div className="mt-5 text-center text-sm text-slate-400">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
