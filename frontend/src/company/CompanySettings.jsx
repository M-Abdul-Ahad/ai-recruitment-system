import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function CompanySettings() {
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/companies/me/");
        setCompany(res.data);
      } catch (err) {
        console.error("Fetch company error:", err);
        setError("Could not load company details.");
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, []);

  return (
    <div className="apl-animate-fade max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
          Company Controls & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          View organization profile settings, verified account details, and recruitment configuration.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Settings Form / View */}
      <div className="apl-card space-y-6">
        <div className="flex items-center gap-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3D4127] text-[#D4DE95] font-extrabold text-2xl flex items-center justify-center shadow-md">
            {(company?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              {loading ? "Loading..." : company?.name || "Demo Company"}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#4E7A33]/15 text-[#4E7A33] mt-1">
              Active Organization Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
              Company Name
            </label>
            <div className="p-3 rounded-xl bg-[#ECEEDF]/50 dark:bg-[#1A1D13] font-bold text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E]">
              {company?.name || "Demo Company"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
              Contact Email
            </label>
            <div className="p-3 rounded-xl bg-[#ECEEDF]/50 dark:bg-[#1A1D13] font-bold text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E]">
              {company?.email || user?.email || "contact@company.com"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
              Industry / Sector
            </label>
            <div className="p-3 rounded-xl bg-[#ECEEDF]/50 dark:bg-[#1A1D13] font-bold text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E]">
              {company?.industry || "Technology & Software Solutions"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
              Website Domain
            </label>
            <div className="p-3 rounded-xl bg-[#ECEEDF]/50 dark:bg-[#1A1D13] font-bold text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E]">
              {company?.website || "https://example.com"}
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
              Company Description
            </label>
            <div className="p-3 rounded-xl bg-[#ECEEDF]/50 dark:bg-[#1A1D13] font-medium text-[#22241B] dark:text-[#EBF0DA] border border-[#ECEEDF] dark:border-[#2A2E1E] leading-relaxed">
              {company?.description || "High-growth technology enterprise utilizing AI recruitment pipelines."}
            </div>
          </div>
        </div>

        <div className="border-t border-[#ECEEDF] dark:border-[#2A2E1E] pt-4 flex items-center justify-between">
          <span className="text-xs text-[#8A8F76]">
            Company ID: <strong className="text-[#22241B] dark:text-[#EBF0DA]">#{company?.id || 1}</strong>
          </span>
          <span className="text-xs text-[#8A8F76]">
            Registered Owner: <strong className="text-[#22241B] dark:text-[#EBF0DA]">{user?.email}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
