import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getApplicantStats } from "../api/jobs";
import { DonutChart, HorizontalBarChart } from "../components/ui/DashboardCharts";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email
    ? user.email.split("@")[0]
    : "Applicant";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getApplicantStats();
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load applicant dashboard stats:", err);
      setError("Unable to load real-time candidate statistics.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Applications Submitted",
      value: loading ? "—" : stats?.total_applied ?? 0,
      sub: "Total jobs applied",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
        </svg>
      ),
      color: "bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]",
    },
    {
      title: "Shortlisted",
      value: loading ? "—" : stats?.status_breakdown?.shortlisted ?? 0,
      sub: "Advanced to review",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "bg-[#4E7A33]/15 text-[#4E7A33]",
    },
    {
      title: "Interviews Scheduled",
      value: loading ? "—" : stats?.status_breakdown?.interview ?? 0,
      sub: "Direct interviews",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      ),
      color: "bg-[#3D4127]/20 text-[#3D4127] dark:text-[#EBF0DA]",
    },
    {
      title: "Latest AI Resume Score",
      value: loading ? "—" : stats?.resume_stats?.ai_score ? `${stats.resume_stats.ai_score}/100` : "No upload",
      sub: stats?.resume_stats?.ai_score ? "AI quality analysis" : "Upload to calculate",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-[#C99A3E]/20 text-[#C99A3E]",
    },
  ];

  const appStatusDonutData = [
    { label: "Submitted", value: stats?.status_breakdown?.applied || 0, color: "#8A8F76" },
    { label: "Shortlisted", value: stats?.status_breakdown?.shortlisted || 0, color: "#D4DE95" },
    { label: "Interview", value: stats?.status_breakdown?.interview || 0, color: "#4E7A33" },
    { label: "Rejected", value: stats?.status_breakdown?.rejected || 0, color: "#B4453D" },
  ];

  // Category scores from resume (Impact, Brevity, Style, Skills, etc.)
  const categoryScores = stats?.resume_stats?.ai_category_scores || {};
  const resumeScoreBars = Object.entries(categoryScores).map(([k, v]) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: typeof v === "number" ? v : parseInt(v, 10) || 0,
    color: "#636B2F",
  }));

  const recentApplications = stats?.recent_applications || [];

  return (
    <div className="apl-animate-fade space-y-6 sm:space-y-8">
      {/* ── HERO BANNER ── */}
      <div className="apl-card-hero flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#3D4127] text-[#D4DE95]">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            AI Career Assistant
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="capitalize">{displayName}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-[#3D4127] opacity-90 leading-relaxed">
            Your real-time candidate career workspace. Track job application milestones, evaluate AI resume feedback, and apply to open requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/applicant/jobs"
            className="apl-btn apl-btn-dark shadow-md hover:shadow-lg transition-transform active:scale-95 text-xs py-2 px-4"
          >
            Explore Open Jobs &rarr;
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="apl-btn bg-[#ECEEDF] text-[#22241B] hover:bg-[#D4DE95] text-xs py-2 px-4 font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── REAL DYNAMIC METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((st, i) => (
          <div key={i} className="apl-card apl-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
                {st.title}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${st.color}`}>
                {st.icon}
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

      {/* ── REAL VISUAL CHARTS (APPLICATION PIPELINE & AI RESUME SCORES) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Chart */}
        <div className="apl-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                My Application Pipeline
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Status distribution of your submitted job applications
              </p>
            </div>
            <Link to="/applicant/applications" className="text-xs font-bold text-[#4E7A33] hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="pt-2">
            <DonutChart
              data={appStatusDonutData}
              centerLabel="Applications"
              centerValue={stats?.total_applied ?? 0}
            />
          </div>
        </div>

        {/* AI Resume Scores Chart */}
        <div className="apl-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                AI Resume Evaluation Dimensions
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Scores generated by Gemini for your latest uploaded resume
              </p>
            </div>
            <Link to="/applicant/resume" className="text-xs font-bold text-[#4E7A33] hover:underline">
              Analyze Resume &rarr;
            </Link>
          </div>

          <div className="pt-2">
            {resumeScoreBars.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-[#8A8F76]">
                  No AI scoring data available. Upload your resume to see skill & formatting dimensions.
                </p>
                <Link to="/applicant/resume" className="apl-btn apl-btn-primary text-xs py-1.5 px-3 inline-block">
                  Upload Resume
                </Link>
              </div>
            ) : (
              <HorizontalBarChart items={resumeScoreBars} />
            )}
          </div>
        </div>
      </div>

      {/* ── LIVE RECENT APPLICATIONS TABLE ── */}
      <div className="apl-card p-0 overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-[#ECEEDF] dark:border-[#2A2E1E] flex justify-between items-center bg-[#F8F9F1]/50 dark:bg-[#171911]/50">
          <div>
            <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">Recent Applications</h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">Real-time review and feedback status from hiring teams</p>
          </div>
          <Link
            to="/applicant/applications"
            className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1 group"
          >
            <span>All Applications</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#8A8F76]">Loading applications...</div>
        ) : recentApplications.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-[#8A8F76]">You haven't submitted any job applications yet.</p>
            <Link
              to="/applicant/jobs"
              className="inline-block py-1.5 px-4 rounded-xl text-xs font-bold bg-[#D4DE95] text-[#3D4127] hover:bg-[#C6D17E] transition-all"
            >
              Browse Open Positions
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 hover:bg-[#D4DE95]/10 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#22241B] dark:text-[#EBF0DA] text-sm mb-0.5">
                    {app.job_title}
                  </h4>
                  <span className="text-[#8A8F76]">{app.company_name}</span>
                </div>

                <div className="flex items-center gap-4">
                  {app.match_score !== null && (
                    <span className="font-mono font-bold text-[#4E7A33]">
                      {Math.round(app.match_score * 100)}% Match
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === "SHORTLISTED"
                        ? "bg-[#D4DE95] text-[#22241B]"
                        : app.status === "INTERVIEW"
                        ? "bg-[#4E7A33]/20 text-[#4E7A33]"
                        : app.status === "REJECTED"
                        ? "bg-[#B4453D]/15 text-[#B4453D]"
                        : "bg-[#ECEEDF] text-[#52564A]"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
