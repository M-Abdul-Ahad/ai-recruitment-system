import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/jobs";

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email
    ? user.email.split("@")[0]
    : "Recruiter";

  const isCompanyAdmin = user?.role === "company_admin";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      setStatsData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Unable to load real-time statistics.");
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  // Dynamic stat cards based on actual backend numbers
  const stats = [
    {
      name: 'Total Jobs',
      value: loading ? '—' : statsData?.total_jobs ?? 0,
      subtext: isCompanyAdmin ? 'Across company' : 'Created by you',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      name: 'Active Listings',
      value: loading ? '—' : statsData?.active_jobs ?? 0,
      subtext: 'Open to candidates',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      name: 'Draft / Closed',
      value: loading ? '—' : (statsData?.draft_jobs ?? 0) + (statsData?.closed_jobs ?? 0),
      subtext: `${statsData?.draft_jobs ?? 0} draft • ${statsData?.closed_jobs ?? 0} closed`,
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      name: 'Candidate Applications',
      value: loading ? '—' : statsData?.total_applicants ?? 0,
      subtext: 'In your pipeline',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
  ];

  const recentJobs = statsData?.recent_jobs || [];

  return (
    <div className="apl-animate-fade space-y-6 sm:space-y-8">
      {/* ── HERO BANNER ── */}
      <div className="apl-card-hero flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#3D4127] text-[#D4DE95]">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            {isCompanyAdmin ? "Company Admin Workspace" : "Recruiter Workspace"}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="capitalize">{displayName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-[#3D4127] opacity-90 leading-relaxed">
            {isCompanyAdmin
              ? "Viewing company-wide hiring pipeline. Manage all job postings, team recruiters, and AI candidate shortlists."
              : "Here is your real-time recruitment pipeline. Track your assigned job requisitions and candidate applications."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/recruiter/jobs/create"
            className="apl-btn apl-btn-dark shadow-md hover:shadow-lg transition-transform active:scale-95"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Create New Job
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── REAL DYNAMIC STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="apl-card apl-card-hover flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
                {stat.name}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#D4DE95]/20 group-hover:bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold flex-shrink-0 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight apl-font-mono mb-1">
                {stat.value}
              </h3>
              <p className="text-xs font-medium text-[#8A8F76] dark:text-[#9CA485]">
                {stat.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── REAL RECENT JOBS SECTION ── */}
      <div className="apl-card p-0 overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-[#ECEEDF] dark:border-[#2A2E1E] flex justify-between items-center bg-[#F8F9F1]/50 dark:bg-[#171911]/50">
          <div>
            <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
              {isCompanyAdmin ? "Company Job Postings" : "Your Recent Job Postings"}
            </h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
              {isCompanyAdmin
                ? "Live overview of requisitions across all recruiters in your company"
                : "Track candidate interest and status on your posted listings"}
            </p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1 group"
          >
            <span>View All Jobs</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#8A8F76]">
            Loading real-time job requisitions...
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-[#8A8F76]">No job postings found.</p>
            <Link
              to="/recruiter/jobs/create"
              className="inline-block py-1.5 px-4 rounded-xl text-xs font-bold bg-[#D4DE95] text-[#3D4127] hover:bg-[#C6D17E] transition-all"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 sm:p-5 hover:bg-[#D4DE95]/10 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#22241B] dark:text-[#EBF0DA] mb-1 truncate">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#8A8F76] dark:text-[#9CA485]">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    {job.created_by_name && (
                      <span className="text-[11px] text-[#52564A] dark:text-[#BAC095]">
                        by {job.created_by_name}
                      </span>
                    )}
                    <span className="text-[11px] text-[#8A8F76]">
                      {timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">
                      {job.applicants}
                    </p>
                    <p className="text-[10px] text-[#8A8F76] dark:text-[#9CA485] uppercase font-semibold tracking-wider">
                      Applicants
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        job.status === "ACTIVE"
                          ? "bg-[#4E7A33]/15 text-[#4E7A33] border-[#4E7A33]/30"
                          : job.status === "DRAFT"
                          ? "bg-[#BAC095]/20 text-[#52564A] border-[#BAC095]/40"
                          : "bg-[#B4453D]/15 text-[#B4453D] border-[#B4453D]/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          job.status === "ACTIVE" ? "bg-[#4E7A33] animate-pulse" : "bg-[#8A8F76]"
                        }`}
                      />
                      {job.status}
                    </span>
                  </div>

                  <Link
                    to="/recruiter/jobs"
                    className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#3D4127] dark:hover:text-[#D4DE95] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors"
                    title="View Job"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
