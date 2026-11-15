import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCompanyDashboardStats } from "../api/jobs";
import api from "../api/axios";
import { DonutChart, FunnelProgress } from "../components/ui/DashboardCharts";

export default function CompanyDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, membRes, statsRes] = await Promise.allSettled([
        api.get("/companies/me/"),
        api.get("/companies/members/"),
        getCompanyDashboardStats(),
      ]);

      if (compRes.status === "fulfilled") setCompany(compRes.value.data);
      if (membRes.status === "fulfilled") setMembers(membRes.value.data);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch (err) {
      console.error("Error loading company dashboard:", err);
      setError("Could not fetch company metrics.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="apl-animate-fade max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#22241B] to-[#3D4127] text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#D4DE95]/20 text-[#D4DE95] mb-2 uppercase tracking-wider">
            Company Executive Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.email?.split("@")[0] || "Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA485] mt-1">
            Organization dashboard for <span className="text-white font-bold">{company?.name || "Your Company"}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/company/recruiters"
            className="apl-btn apl-btn-primary text-xs py-2 px-4 shadow-sm"
          >
            + Add Recruiter / HR
          </Link>
          <Link
            to="/recruiter"
            className="apl-btn bg-[#ECEEDF] text-[#22241B] hover:bg-[#D4DE95] text-xs py-2 px-4 font-bold"
          >
            Recruiter Workspace &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Real Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apl-card space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
            Company Verification
          </span>
          <div className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
            {company?.name || "Company"}
          </div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33] capitalize">
            {company?.verification_status || "Registered"}
          </span>
        </div>

        <Link
          to="/company/recruiters"
          className="apl-card space-y-1 hover:border-[#D4DE95] transition-all cursor-pointer block group"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76] group-hover:text-[#3D4127] dark:group-hover:text-[#D4DE95] transition-colors">
            Team Strength
          </span>
          <div className="text-2xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] font-mono">
            {loading ? "…" : stats?.total_members ?? members.length}
          </div>
          <span className="text-xs text-[#8A8F76]">
            {stats?.hr_count ?? 1} recruiters / HR active &rarr;
          </span>
        </Link>

        <Link
          to="/recruiter/jobs"
          className="apl-card space-y-1 hover:border-[#D4DE95] transition-all cursor-pointer block group"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76] group-hover:text-[#3D4127] dark:group-hover:text-[#D4DE95] transition-colors">
            Company Jobs
          </span>
          <div className="text-2xl font-extrabold text-[#3D4127] dark:text-[#D4DE95] font-mono">
            {loading ? "…" : stats?.total_jobs ?? 0}
          </div>
          <span className="text-xs text-[#8A8F76]">
            {stats?.active_jobs ?? 0} active openings &rarr;
          </span>
        </Link>

        <Link
          to="/recruiter/candidates"
          className="apl-card space-y-1 hover:border-[#D4DE95] transition-all cursor-pointer block group"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76] group-hover:text-[#3D4127] dark:group-hover:text-[#D4DE95] transition-colors">
            Candidate Inflow
          </span>
          <div className="text-2xl font-extrabold text-[#4E7A33] font-mono">
            {loading ? "…" : stats?.total_applicants ?? 0}
          </div>
          <span className="text-xs text-[#8A8F76]">Total applications received &rarr;</span>
        </Link>
      </div>

      {/* Real Charts: Hiring Pipeline & Job Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline conversion tracker */}
        <div className="apl-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Hiring Pipeline & Candidate Progression
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Real-time conversion of candidate applications across your company
              </p>
            </div>
            <Link to="/recruiter/candidates" className="text-xs font-bold text-[#4E7A33] hover:underline">
              View Candidates &rarr;
            </Link>
          </div>

          <FunnelProgress stages={funnelStages} />
        </div>

        {/* Job Status breakdown */}
        <div className="apl-card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Job Portfolio
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Status distribution of listings
              </p>
            </div>
          </div>

          <DonutChart
            data={jobDistribution}
            centerLabel="Total Jobs"
            centerValue={stats?.total_jobs || 0}
            size={160}
          />
        </div>
      </div>

      {/* Team & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <div className="apl-card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
              Organization Profile
            </h3>
            <Link to="/company/settings" className="text-xs font-bold text-[#4E7A33] hover:underline">
              Settings &rarr;
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Legal Name
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] text-sm">
                {company?.name || "Company"}
              </span>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Website
              </span>
              <a
                href={company?.website || "#"}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#4E7A33] truncate block hover:underline"
              >
                {company?.website || "Not provided"}
              </a>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Industry
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                {company?.industry || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Owner Email
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Recruiter Team */}
        <div className="apl-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Recruitment Team
              </h3>
              <p className="text-xs text-[#8A8F76]">
                Members authorized to recruit for {company?.name || "your organization"}
              </p>
            </div>
            <Link to="/company/recruiters" className="apl-btn apl-btn-primary text-xs py-1.5 px-3">
              Manage Team &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#8A8F76]">Loading team members...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-[#8A8F76]">No team members registered yet.</p>
              <Link to="/company/recruiters" className="text-xs font-bold text-[#4E7A33] hover:underline">
                Add Recruiter / HR
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3D4127] text-[#D4DE95] font-bold text-xs flex items-center justify-center">
                      {(member.username || member.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                        {member.first_name ? `${member.first_name} ${member.last_name || ""}`.trim() : member.username || member.email}
                      </div>
                      <div className="text-[11px] text-[#8A8F76]">{member.email}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      member.role === "company_admin"
                        ? "bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]"
                        : member.is_hr
                        ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {member.role === "company_admin" ? "Company Admin" : member.is_hr ? "HR / Recruiter" : member.role || "Member"}
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
