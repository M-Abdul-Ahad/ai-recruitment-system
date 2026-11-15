import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats } from "../api/jobs";
import { DonutChart, HorizontalBarChart } from "../components/ui/DashboardCharts";

const QUICK_LINKS = [
  {
    to: "/admin/users",
    title: "User Directory",
    desc: "Manage platform accounts and roles",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: "/admin/companies",
    title: "Company Approvals",
    desc: "Verify legal documents and businesses",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9"/><path d="M16 21V9"/><path d="M2 9h20"/>
      </svg>
    ),
  },
  {
    to: "/admin/jobs",
    title: "Job Requisitions",
    desc: "Platform-wide active and closed jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    to: "/admin/roles",
    title: "Role Policies",
    desc: "Configure system roles and permissions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboardStats();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError("Unable to connect to live platform metrics.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: loading ? "—" : data?.total_users ?? 0,
      sub: `${data?.users_by_role?.applicant ?? 0} applicants • ${data?.users_by_role?.recruiter ?? 0} recruiters`,
      color: "bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]",
      icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    },
    {
      label: "Companies",
      value: loading ? "—" : data?.total_companies ?? 0,
      sub: `${data?.companies_by_status?.verified ?? 0} verified • ${data?.companies_by_status?.pending ?? 0} pending`,
      color: "bg-[#4E7A33]/20 text-[#4E7A33]",
      icon: "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16",
    },
    {
      label: "Total Jobs",
      value: loading ? "—" : data?.total_jobs ?? 0,
      sub: `${data?.jobs_by_status?.active ?? 0} active • ${data?.jobs_by_status?.closed ?? 0} closed`,
      color: "bg-[#3D4127]/20 text-[#3D4127] dark:text-[#EBF0DA]",
      icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
    },
    {
      label: "Resumes & Applications",
      value: loading ? "—" : (data?.total_applications ?? 0) + (data?.total_resumes ?? 0),
      sub: `${data?.total_applications ?? 0} applications • ${data?.total_resumes ?? 0} parsed resumes`,
      color: "bg-[#C99A3E]/20 text-[#C99A3E]",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
    },
  ];

  const roleDonutData = [
    { label: "Applicants", value: data?.users_by_role?.applicant || 0, color: "#D4DE95" },
    { label: "Recruiters", value: data?.users_by_role?.recruiter || 0, color: "#636B2F" },
    { label: "Company Admins", value: data?.users_by_role?.company_admin || 0, color: "#3D4127" },
    { label: "System Admins", value: data?.users_by_role?.admin || 0, color: "#4E7A33" },
  ];

  const companyBarItems = [
    { label: "Verified Companies", value: data?.companies_by_status?.verified || 0, color: "#4E7A33" },
    { label: "Pending Verification", value: data?.companies_by_status?.pending || 0, color: "#C99A3E" },
    { label: "Unverified / Incomplete", value: data?.companies_by_status?.unverified || 0, color: "#8A8F76" },
    { label: "Rejected Applications", value: data?.companies_by_status?.rejected || 0, color: "#B4453D" },
  ];

  return (
    <div className="apl-animate-fade space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="apl-card-hero flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#3D4127] text-[#D4DE95]">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            System Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-sm md:text-base text-[#3D4127] opacity-90 leading-relaxed">
            Real-time audit overview across all organizations, candidate accounts, job requisitions, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/companies" className="apl-btn apl-btn-dark shadow-md text-xs py-2 px-4 font-bold">
            Review Verifications &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((st, i) => (
          <div key={i} className="apl-card apl-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
                {st.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${st.color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={st.icon} />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight font-mono mb-1">
                {st.value}
              </h3>
              <p className="text-xs font-medium text-[#8A8F76] dark:text-[#9CA485]">
                {st.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Real Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: User Distribution Donut */}
        <div className="apl-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Platform User Composition
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Live breakdown of registered accounts by system role
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#3D4127] dark:text-[#D4DE95]">
              {data?.total_users || 0} Total
            </span>
          </div>

          <div className="pt-2">
            <DonutChart
              data={roleDonutData}
              centerLabel="Active Users"
              centerValue={data?.total_users || 0}
            />
          </div>
        </div>

        {/* Chart 2: Company Verification Breakdown */}
        <div className="apl-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Organization Verification Status
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Compliance review & legal documentation status
              </p>
            </div>
            <Link to="/admin/companies" className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline">
              Manage &rarr;
            </Link>
          </div>

          <div className="pt-2">
            <HorizontalBarChart items={companyBarItems} />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] mb-3">
          Quick Management Portals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((card) => (
            <Link key={card.to} to={card.to} className="block no-underline group">
              <div className="apl-card apl-card-hover flex flex-col gap-3 group-hover:border-[#D4DE95] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#D4DE95]/20 group-hover:bg-[#D4DE95] text-[#3D4127] flex items-center justify-center transition-colors">
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
