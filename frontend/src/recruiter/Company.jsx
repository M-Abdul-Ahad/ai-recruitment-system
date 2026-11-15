import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Company = () => {
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const [compRes, membRes] = await Promise.allSettled([
        api.get("/companies/me/"),
        api.get("/companies/members/"),
      ]);
      if (compRes.status === "fulfilled") setCompany(compRes.value.data);
      if (membRes.status === "fulfilled") setMembers(membRes.value.data || []);
    } catch (err) {
      console.error("Failed to fetch company details:", err);
    } finally {
      setLoading(false);
    }
  };

  const companyInitials = company?.name
    ? company.name.slice(0, 2).toUpperCase()
    : "CO";

  return (
    <div className="apl-animate-fade max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
            Company & Hiring Team
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
            Organization profile, team members, and recruitment collaboration
          </p>
        </div>
        {user?.role === "company_admin" && (
          <Link
            to="/company/recruiters"
            className="apl-btn apl-btn-primary py-2 px-4 text-xs font-bold shadow-sm"
          >
            Manage Team & Invitations &rarr;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Company Info */}
        <div className="apl-card md:col-span-1 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4DE95] text-[#3D4127] font-extrabold text-xl flex items-center justify-center shadow-xs">
              {companyInitials}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA] truncate">
                {company?.name || "Company Profile"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4E7A33]/15 text-[#4E7A33]">
                {company?.verification_status || "Registered"}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Industry
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA]">
                {company?.industry || "Technology / Professional Services"}
              </span>
            </div>
            {company?.website && (
              <div>
                <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                  Website
                </span>
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#4E7A33] hover:underline truncate block"
                >
                  {company.website}
                </a>
              </div>
            )}
            <div>
              <span className="text-[#8A8F76] font-semibold uppercase tracking-wider block text-[10px]">
                Your Role
              </span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] capitalize">
                {user?.role?.replace("_", " ") ?? "Recruiter"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Hiring Team Members */}
        <div className="apl-card md:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                Hiring Team Members
              </h3>
              <p className="text-xs text-[#8A8F76]">
                Recruiters and hiring managers collaborating on requisitions
              </p>
            </div>
            <span className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] px-2.5 py-1 rounded-lg bg-[#D4DE95]/20">
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8A8F76]">
              No other hiring team members listed yet.
            </div>
          ) : (
            <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
              {members.map((m) => {
                const memberName = m.first_name || m.last_name
                  ? `${m.first_name || ""} ${m.last_name || ""}`.trim()
                  : m.username || m.email?.split("@")[0] || "User";
                const initial = (m.first_name || m.email || "U").charAt(0).toUpperCase();

                return (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#3D4127] text-[#D4DE95] font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA] truncate">
                          {memberName}
                        </h4>
                        <p className="text-xs text-[#8A8F76] truncate">{m.email}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] capitalize flex-shrink-0">
                      {m.role ? m.role.replace("_", " ") : "Recruiter"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Company;
