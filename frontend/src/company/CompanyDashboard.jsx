import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCompanyDashboardStats } from "../api/jobs";
import api from "../api/axios";
import { DonutChart, FunnelProgress } from "../components/ui/DashboardCharts";

/* ── Inline SVG Icons for executive dashboard ── */
const DashboardIcons = {
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
};

export default function CompanyDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, membRes, statsRes] = await Promise.allSettled([
        api.get("/companies/me/"),
        api.get("/companies/members/", { params: { paginate: false } }),
        getCompanyDashboardStats(),
      ]);

      if (compRes.status === "fulfilled") {
        setCompany(compRes.value.data);
      }
      if (membRes.status === "fulfilled") {
        const memberList = Array.isArray(membRes.value.data)
          ? membRes.value.data
          : membRes.value.data?.results || [];
        setMembers(memberList);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading company dashboard:", err);
      setError("Could not load organization metrics. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const jobDistribution = [
    { label: "Active Jobs", value: stats?.active_jobs || 0, color: "#4E7A33" },
    { label: "Draft Requisitions", value: stats?.draft_jobs || 0, color: "#C99A3E" },
    { label: "Closed Jobs", value: stats?.closed_jobs || 0, color: "#8A8F76" },
  ];

  const funnelStages = [
    { label: "Applied", count: stats?.application_status_breakdown?.applied || 0, color: "#8A8F76" },
    { label: "Shortlisted", count: stats?.application_status_breakdown?.shortlisted || 0, color: "#D4DE95" },
    { label: "Interview", count: stats?.application_status_breakdown?.interview || 0, color: "#4E7A33" },
    { label: "Rejected", count: stats?.application_status_breakdown?.rejected || 0, color: "#B4453D" },
  ];

  const isVerified = (company?.verification_status || "").toLowerCase() === "verified";
  const isPending = (company?.verification_status || "").toLowerCase() === "pending";

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Administrator";

  return (
    <div className="apl-animate-fade max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* ── Top Hero Banner (Mossy Hollow Executive Gradient) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#22241B] via-[#323620] to-[#3D4127] text-white p-6 sm:p-8 shadow-lg border border-[#D4DE95]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#D4DE95]/20 text-[#D4DE95] border border-[#D4DE95]/30 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4DE95] animate-pulse" />
              Company Executive Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#BAC095] leading-relaxed">
              Executive overview for{" "}
              <span className="text-white font-bold">{company?.name || "Your Company"}</span>. Track real-time job requisitions, recruiter team activity, and applicant pipeline conversion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/company/recruiters"
              className="apl-btn apl-btn-primary text-xs py-2.5 px-4 font-bold shadow-md hover:shadow-lg transition-all"
            >
              <DashboardIcons.Plus />
              Add Recruiter / HR
            </Link>
            <Link
              to="/recruiter"
              className="apl-btn bg-[#ECEEDF] text-[#22241B] hover:bg-[#D4DE95] text-xs py-2.5 px-4 font-bold transition-all"
            >
              Recruiter Workspace &rarr;
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#D4DE95]/10 blur-3xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchData} className="underline hover:text-red-700 font-bold ml-3">
            Retry
          </button>
        </div>
      )}

      {/* ── Executive KPI Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verification Status */}
        <div className="apl-card hover:-translate-y-1 hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--apl-neutral-500)]">
              Verification Status
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isVerified ? "bg-[#4E7A33]/15 text-[#4E7A33]" : isPending ? "bg-[#C99A3E]/15 text-[#C99A3E]" : "bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)]"
            }`}>
              <DashboardIcons.ShieldCheck />
            </div>
          </div>
          <div className="text-lg font-extrabold text-[var(--apl-neutral-900)] truncate">
            {company?.name || "Company"}
          </div>
          <div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
              isVerified
                ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                : isPending
                ? "bg-[#C99A3E]/15 text-[#C99A3E]"
                : "bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)]"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? "bg-[#4E7A33]" : isPending ? "bg-[#C99A3E]" : "bg-gray-400"}`} />
              {company?.verification_status ? company.verification_status.replace("_", " ") : "Registered"}
            </span>
          </div>
        </div>

        {/* Team Strength */}
        <Link
          to="/company/recruiters"
          className="apl-card hover:-translate-y-1 hover:shadow-md hover:border-[#D4DE95] transition-all duration-200 cursor-pointer block group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--apl-neutral-500)] group-hover:text-[var(--apl-dark)] dark:group-hover:text-[#D4DE95] transition-colors">
              Team Strength
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#636B2F]/15 text-[#636B2F] dark:text-[#D4DE95] flex items-center justify-center">
              <DashboardIcons.Users />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--apl-neutral-900)] font-mono">
            {loading ? "…" : stats?.total_members ?? members.length}
          </div>
          <span className="text-xs text-[var(--apl-neutral-500)] flex items-center gap-1 group-hover:text-[#636B2F] transition-colors">
            {stats?.hr_count ?? members.filter((m) => m.is_hr).length} recruiters / HR active
            <DashboardIcons.ArrowRight />
          </span>
        </Link>

        {/* Company Jobs */}
        <Link
          to="/recruiter/jobs"
          className="apl-card hover:-translate-y-1 hover:shadow-md hover:border-[#D4DE95] transition-all duration-200 cursor-pointer block group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--apl-neutral-500)] group-hover:text-[var(--apl-dark)] dark:group-hover:text-[#D4DE95] transition-colors">
              Company Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3D4127]/15 text-[#3D4127] dark:text-[#D4DE95] flex items-center justify-center">
              <DashboardIcons.Briefcase />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#3D4127] dark:text-[#D4DE95] font-mono">
            {loading ? "…" : stats?.total_jobs ?? 0}
          </div>
          <span className="text-xs text-[var(--apl-neutral-500)] flex items-center gap-1 group-hover:text-[#3D4127] dark:group-hover:text-[#D4DE95] transition-colors">
            {stats?.active_jobs ?? 0} active requisitions
            <DashboardIcons.ArrowRight />
          </span>
        </Link>

        {/* Candidate Inflow */}
        <Link
          to="/recruiter/candidates"
          className="apl-card hover:-translate-y-1 hover:shadow-md hover:border-[#D4DE95] transition-all duration-200 cursor-pointer block group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--apl-neutral-500)] group-hover:text-[var(--apl-dark)] dark:group-hover:text-[#D4DE95] transition-colors">
              Candidate Inflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#4E7A33]/15 text-[#4E7A33] flex items-center justify-center">
              <DashboardIcons.UserCheck />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#4E7A33] font-mono">
            {loading ? "…" : stats?.total_applicants ?? 0}
          </div>
          <span className="text-xs text-[var(--apl-neutral-500)] flex items-center gap-1 group-hover:text-[#4E7A33] transition-colors">
            Total applications received
            <DashboardIcons.ArrowRight />
          </span>
        </Link>
      </div>

      {/* ── Hiring Pipeline Funnel & Job Distribution Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline conversion tracker */}
        <div className="apl-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--apl-neutral-100)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[var(--apl-neutral-900)]">
                Hiring Pipeline & Candidate Progression
              </h3>
              <p className="text-xs text-[var(--apl-neutral-500)]">
                Real-time conversion of candidate applications across your company
              </p>
            </div>
            <Link
              to="/recruiter/candidates"
              className="text-xs font-bold text-[#4E7A33] hover:underline inline-flex items-center gap-1"
            >
              Candidate Board &rarr;
            </Link>
          </div>

          <FunnelProgress stages={funnelStages} />
        </div>

        {/* Job Status breakdown */}
        <div className="apl-card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--apl-neutral-100)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[var(--apl-neutral-900)]">
                Job Portfolio
              </h3>
              <p className="text-xs text-[var(--apl-neutral-500)]">
                Status distribution of listings
              </p>
            </div>
            <Link to="/recruiter/jobs" className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline">
              View All &rarr;
            </Link>
          </div>

          <DonutChart
            data={jobDistribution}
            centerLabel="Total Jobs"
            centerValue={stats?.total_jobs || 0}
            size={160}
          />
        </div>
      </div>

      {/* ── Split: Organization Profile & Recruitment Team Roster ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <div className="apl-card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--apl-neutral-100)] pb-3">
            <h3 className="text-base font-bold text-[var(--apl-neutral-900)]">
              Organization Profile
            </h3>
            <Link to="/company/settings" className="text-xs font-bold text-[#4E7A33] hover:underline">
              Edit &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[var(--apl-neutral-500)] font-semibold uppercase tracking-wider block text-[10px]">
                Legal Entity Name
              </span>
              <span className="font-bold text-[var(--apl-neutral-900)] text-sm">
                {company?.name || "Company"}
              </span>
            </div>

            <div>
              <span className="text-[var(--apl-neutral-500)] font-semibold uppercase tracking-wider block text-[10px]">
                Official Website
              </span>
              {company?.website ? (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#4E7A33] truncate block hover:underline"
                >
                  {company.website}
                </a>
              ) : (
                <span className="text-[var(--apl-neutral-500)] italic">Not provided</span>
              )}
            </div>

            <div>
              <span className="text-[var(--apl-neutral-500)] font-semibold uppercase tracking-wider block text-[10px]">
                Industry Sector
              </span>
              <span className="font-bold text-[var(--apl-neutral-900)]">
                {company?.industry || "Technology / Corporate"}
              </span>
            </div>

            {company?.tax_id && (
              <div>
                <span className="text-[var(--apl-neutral-500)] font-semibold uppercase tracking-wider block text-[10px]">
                  Tax ID / Registration
                </span>
                <span className="font-mono font-bold text-[var(--apl-neutral-900)]">
                  {company.tax_id}
                </span>
              </div>
            )}

            <div>
              <span className="text-[var(--apl-neutral-500)] font-semibold uppercase tracking-wider block text-[10px]">
                Primary Admin Account
              </span>
              <span className="font-bold text-[var(--apl-neutral-900)]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Recruiter Team */}
        <div className="apl-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--apl-neutral-100)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[var(--apl-neutral-900)]">
                Recruiter Roster
              </h3>
              <p className="text-xs text-[var(--apl-neutral-500)]">
                Authorized hiring team for {company?.name || "your organization"}
              </p>
            </div>
            <Link to="/company/recruiters" className="apl-btn apl-btn-primary text-xs py-1.5 px-3 font-bold">
              Manage Team &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--apl-neutral-500)]">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-[var(--apl-neutral-500)]">No team members registered yet.</p>
              <Link to="/company/recruiters" className="text-xs font-bold text-[#4E7A33] hover:underline">
                + Add Recruiter / HR
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--apl-neutral-100)]">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--apl-sb-bg)] text-[#D4DE95] font-bold text-xs flex items-center justify-center shadow-xs">
                      {(member.username || member.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--apl-neutral-900)]">
                        {member.first_name
                          ? `${member.first_name} ${member.last_name || ""}`.trim()
                          : member.username || member.email}
                      </div>
                      <div className="text-[11px] text-[var(--apl-neutral-500)]">{member.email}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      member.role === "company_admin"
                        ? "bg-[#D4DE95]/25 text-[#3D4127] dark:text-[#D4DE95]"
                        : member.is_hr
                        ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                        : "bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)]"
                    }`}
                  >
                    {member.role === "company_admin"
                      ? "Company Admin"
                      : member.is_hr
                      ? "HR / Recruiter"
                      : member.role || "Member"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
