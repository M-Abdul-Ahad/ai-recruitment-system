import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);

  const displayName = user?.email ? user.email.split("@")[0] : "Recruiter";

  // Stats data
  const stats = [
    { name: 'Total Jobs', value: '12', change: '+2 this month', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Active Jobs', value: '4', change: '1 closing soon', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Closed Jobs', value: '8', change: 'Matched 45 candidates', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'New Applicants', value: '128', change: '+14% from last week', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  // Recent jobs data
  const recentJobs = [
    { id: 1, title: 'Senior Frontend Developer', location: 'Remote', status: 'Active', applicants: 45, date: '2 days ago' },
    { id: 2, title: 'Backend Engineer (Python)', location: 'New York, NY', status: 'Active', applicants: 32, date: '5 days ago' },
    { id: 3, title: 'Product Manager', location: 'San Francisco, CA', status: 'Closed', applicants: 89, date: '2 weeks ago' },
  ];

  return (
    <div className="apl-animate-fade space-y-8">
      {/* ── HERO BANNER ── */}
      <div className="apl-card-hero flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#3D4127] text-[#D4DE95]">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            Recruiter Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="capitalize">{displayName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-[#3D4127] opacity-90 leading-relaxed">
            Here is a real-time summary of your hiring pipeline. Create new job requisitions, evaluate candidate applications, and run AI shortlisting.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/recruiter/jobs/create"
            className="apl-btn apl-btn-dark shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Create New Job
          </Link>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="apl-card apl-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
                {stat.name}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight apl-font-mono mb-1">
                {stat.value}
              </h3>
              <p className="text-xs font-medium text-[#8A8F76] dark:text-[#9CA485]">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECENT JOBS SECTION ── */}
      <div className="apl-card p-0 overflow-hidden">
        <div className="p-6 border-b border-[#ECEEDF] dark:border-[#2A2E1E] flex justify-between items-center bg-[#F8F9F1]/50 dark:bg-[#171911]/50">
          <div>
            <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">Recent Job Postings</h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">Track candidate interest across your latest active listings</p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1"
          >
            View All Jobs &rarr;
          </Link>
        </div>

        <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
          {recentJobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-[#D4DE95]/10 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] mb-1 truncate">
                  {job.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#8A8F76] dark:text-[#9CA485]">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.date}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] apl-font-mono">{job.applicants}</p>
                  <p className="text-[10px] text-[#8A8F76] dark:text-[#9CA485] uppercase font-semibold tracking-wider">Applicants</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    job.status === 'Active' 
                      ? 'bg-[#4E7A33]/15 text-[#4E7A33] border-[#4E7A33]/30' 
                      : 'bg-[#BAC095]/20 text-[#52564A] border-[#BAC095]/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Active' ? 'bg-[#4E7A33] animate-pulse' : 'bg-[#8A8F76]'}`} />
                    {job.status}
                  </span>
                </div>
                <Link
                  to="/recruiter/jobs"
                  className="p-2 rounded-lg text-[#8A8F76] hover:text-[#3D4127] dark:hover:text-[#D4DE95] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;