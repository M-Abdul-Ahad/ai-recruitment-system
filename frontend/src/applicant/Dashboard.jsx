import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

/* Inline SVG Icons for Quick Actions */
const FileTextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const CheckSquareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("PAGE LOADED: Applicant Dashboard");
  console.log("CURRENT USER:", user);

  const handleLogout = () => {
    console.log("LOGOUT CLICKED");
    logout();
    navigate("/login");
  };

  const displayName = user?.email ? user.email.split("@")[0] : "Applicant";

  return (
    <div className="apl-animate-fade space-y-8">
      {/* ── HERO BANNER ── */}
      <div className="apl-card-hero flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#3D4127] text-[#D4DE95]">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            AI Career Assistant
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="capitalize">{displayName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-[#3D4127] opacity-90 leading-relaxed">
            Your personalized recruitment dashboard is ready. Upload your resume for instant AI scoring, build tailored applications, or explore active opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="apl-btn apl-btn-dark shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── QUICK ACTIONS SECTION ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#22241B] dark:text-[#EBF0DA]">
              Quick Actions
            </h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
              Accelerate your job search with AI tools and tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Resume Analysis */}
          <Link
            to="/applicant/resume"
            className="apl-card apl-card-hover group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <FileTextIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors">
                  Resume Analysis
                </h3>
                <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 leading-relaxed">
                  Upload your PDF or DOCX resume to get instant AI quality score and skill gap feedback.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] gap-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>Start Analysis</span>
              <ArrowRightIcon />
            </div>
          </Link>

          {/* Card 2: AI Resume Builder */}
          <Link
            to="/applicant/builder"
            className="apl-card apl-card-hover group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <SparklesIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors">
                  Resume Builder
                </h3>
                <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 leading-relaxed">
                  Generate tailored resume content targeting specific job titles and tech stacks.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] gap-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>Build Resume</span>
              <ArrowRightIcon />
            </div>
          </Link>

          {/* Card 3: Browse Jobs */}
          <Link
            to="/applicant/jobs"
            className="apl-card apl-card-hover group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <BriefcaseIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors">
                  Browse Jobs
                </h3>
                <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 leading-relaxed">
                  Explore open positions, check salary ranges, and submit applications directly.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] gap-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>Explore Positions</span>
              <ArrowRightIcon />
            </div>
          </Link>

          {/* Card 4: Applications */}
          <Link
            to="/applicant/applications"
            className="apl-card apl-card-hover group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <CheckSquareIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors">
                  My Applications
                </h3>
                <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 leading-relaxed">
                  Track live status of submitted applications, interview invites, and shortlists.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] gap-1 group-hover:translate-x-1 transition-transform pt-2">
              <span>Track Progress</span>
              <ArrowRightIcon />
            </div>
          </Link>
        </div>
      </div>

      {/* ── AI INSIGHTS & STATS BANNER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="apl-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] flex items-center justify-center text-[#636B2F] dark:text-[#D4DE95] font-bold text-sm">
            01
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">Profile Setup</h4>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">Account: {user?.email}</p>
          </div>
        </div>

        <div className="apl-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] flex items-center justify-center text-[#636B2F] dark:text-[#D4DE95] font-bold text-sm">
            02
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">Role Type</h4>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">Applicant Account</p>
          </div>
        </div>

        <div className="apl-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D4DE95] text-[#3D4127] flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">AI Assistant Status</h4>
            <p className="text-xs text-[#4E7A33] font-semibold">Active & Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;