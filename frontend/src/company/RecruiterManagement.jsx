import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function RecruiterManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/companies/members/");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch company members:", err);
      setError("Could not load company members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddHR = async (userId) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/companies/add-hr/", { user_id: userId });
      setSuccess("HR privileges granted successfully.");
      await fetchMembers();
    } catch (err) {
      console.error("Add HR error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.user_id?.[0] ||
          "Failed to grant HR privileges."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveHR = async (userId) => {
    if (!window.confirm("Are you sure you want to revoke HR privileges for this user?")) {
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/companies/remove-hr/", { user_id: userId });
      setSuccess("HR privileges revoked successfully.");
      await fetchMembers();
    } catch (err) {
      console.error("Remove HR error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.user_id?.[0] ||
          "Failed to revoke HR privileges."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const nonHRMembers = members.filter((m) => !m.is_hr);

  return (
    <div className="apl-animate-fade max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
            Recruiter & Team Management
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
            Control recruiter access, HR posting permissions, and team member roles within your company.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs font-bold text-red-500 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-xs font-bold text-green-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Add HR Card */}
      <div className="apl-card space-y-4">
        <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
          Grant HR / Recruiter Permissions
        </h3>
        <p className="text-xs text-[#8A8F76]">
          Assign HR privileges to existing company team members to grant them posting and candidate management capabilities.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUserId) handleAddHR(selectedUserId);
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
            disabled={actionLoading || nonHRMembers.length === 0}
          >
            <option value="">
              {nonHRMembers.length === 0
                ? "All team members currently have HR privileges"
                : "-- Select team member --"}
            </option>
            {nonHRMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.username || m.email || `User #${m.id}`} (ID: {m.id})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!selectedUserId || actionLoading}
            className="apl-btn apl-btn-primary py-2 px-4 text-xs shadow-xs"
          >
            {actionLoading ? "Processing..." : "+ Grant HR Status"}
          </button>
        </form>
      </div>

      {/* Recruiter List */}
      <div className="apl-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Company Team Roster
            </h3>
            <p className="text-xs text-[#8A8F76]">
              All accounts registered under your organization domain and company ID.
            </p>
          </div>
          <span className="text-xs font-bold text-[#8A8F76] bg-[#ECEEDF] dark:bg-[#2A2E1E] px-3 py-1 rounded-full">
            {members.length} Total
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#8A8F76]">Loading team members...</div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A8F76]">No team members registered yet.</div>
        ) : (
          <div className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E]">
            {members.map((member) => {
              const isSelf = member.id === currentUser?.id;
              return (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3D4127] text-[#D4DE95] font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {(member.username || member.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                          {member.username || member.email}
                        </h4>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#D4DE95] text-[#3D4127]">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8F76]">
                        User ID: {member.id} &bull; Role: {member.role || "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.is_hr
                          ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                          : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]"
                      }`}
                    >
                      {member.is_hr ? "HR / Recruiter Active" : "Member"}
                    </span>

                    {member.is_hr && !isSelf && (
                      <button
                        onClick={() => handleRemoveHR(member.id)}
                        disabled={actionLoading}
                        className="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Revoke HR
                      </button>
                    )}

                    {!member.is_hr && (
                      <button
                        onClick={() => handleAddHR(member.id)}
                        disabled={actionLoading}
                        className="text-xs text-[#4E7A33] hover:underline font-bold px-3 py-1"
                      >
                        Grant HR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
