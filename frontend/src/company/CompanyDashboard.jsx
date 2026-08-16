import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function CompanyDashboard() {
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [compRes, membRes] = await Promise.allSettled([
          api.get("/companies/me/"),
          api.get("/companies/members/"),
        ]);

        if (compRes.status === "fulfilled") {
          setCompany(compRes.value.data);
        }
        if (membRes.status === "fulfilled") {
          setMembers(membRes.value.data);
        }
      } catch (err) {
        console.error("Error loading company dashboard:", err);
        setError("Could not fetch company details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalMembers = members.length;
  const hrCount = members.filter((m) => m.is_hr).length;

  return (
    <div className="apl-animate-fade max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#22241B] to-[#3D4127] text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#D4DE95]/20 text-[#D4DE95] mb-2 uppercase tracking-wider">
            Company Management Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.email?.split("@")[0] || "Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA485] mt-1">
            Manage your company profile, recruiter permissions, and hiring organization settings.
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
            Recruiter Portal &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apl-card space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
            Company Name
          </span>
          <div className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
            {company?.name || "Demo Company"}
          </div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33]">
            Verified Account
          </span>
        </div>

        <div className="apl-card space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
            Total Team Members
          </span>
          <div className="text-2xl font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
            {loading ? "..." : totalMembers || 1}
          </div>
          <span className="text-xs text-[#8A8F76]">Registered team members</span>
        </div>

        <div className="apl-card space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
            HR / Recruiters
          </span>
          <div className="text-2xl font-extrabold text-[#4E7A33]">
            {loading ? "..." : hrCount || 1}
          </div>
          <span className="text-xs text-[#8A8F76]">Active recruiters with posting rights</span>
        </div>

        <div className="apl-card space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8F76]">
            Account Role
          </span>
          <div className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] uppercase">
            {user?.role || "company_admin"}
          </div>
          <span className="text-xs text-[#8A8F76]">Full admin access</span>
        </div>
      </div>

      {/* Main Grid: Company Details & Recruiter Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Organization Profile */}
        <div className="apl-card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Organization Details
            </h3>
            <Link to="/company/settings" className="text-xs font-bold text-[#4E7A33] hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Name
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] text-sm">
                {company?.name || "Demo Company"}
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
                {company?.website || "https://example.com"}
              </a>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Industry
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                {company?.industry || "Technology / Software"}
              </span>
            </div>
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Owner Account
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Team Preview */}
        <div className="apl-card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                Recruiter & HR Management
              </h3>
              <p className="text-xs text-[#8A8F76]">
                Overview of team members authorized to recruit for {company?.name || "your company"}.
              </p>
            </div>
            <Link
              to="/company/recruiters"
              className="apl-btn apl-btn-primary text-xs py-1.5 px-3"
            >
              Manage Team &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#8A8F76]">Loading team members...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-[#8A8F76]">No additional team members found.</p>
              <Link to="/company/recruiters" className="text-xs font-bold text-[#4E7A33] hover:underline">
                Add HR / Recruiters
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
                        {member.username || member.email}
                      </div>
                      <div className="text-[11px] text-[#8A8F76]">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        member.is_hr
                          ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {member.is_hr ? "HR / Recruiter" : member.role || "Member"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
