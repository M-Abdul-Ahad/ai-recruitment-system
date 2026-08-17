import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";

export default function RecruiterManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [selectedUserId, setSelectedUserId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
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

  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const res = await api.get("/companies/invitations/");
      setInvitations(res.data);
    } catch (err) {
      console.error("Failed to fetch recruiter invitations:", err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
  }, []);

  const handleInviteRecruiter = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/companies/invitations/", { email: inviteEmail.trim() });
      
      if (res.data && res.data.email_sent === false) {
        setError(
          `Invitation record created for ${inviteEmail.trim()}, but email delivery failed: ${
            res.data.email_error || "Please check SMTP configuration"
          }.`
        );
      } else {
        setSuccess(
          `Invitation successfully sent to ${inviteEmail.trim()}. A password setup link has been emailed.`
        );
      }
      setInviteEmail("");
      await fetchInvitations();
      await fetchMembers();
    } catch (err) {
      console.error("Invite recruiter error:", err);
      setError(
        err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Failed to send recruiter invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };


  const handleRevokeInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await api.delete(`/companies/invitations/${invitationId}/`);
      setSuccess("Invitation revoked successfully.");
      await fetchInvitations();
    } catch (err) {
      console.error("Revoke invitation error:", err);
      setError(err.response?.data?.detail || "Failed to revoke invitation.");
    }
  };

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
            Invite new recruiters, control access permissions, and manage your company roster.
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

      {/* Grid for Actions: Invite Recruiter & Grant HR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Invite Recruiter via Email */}
        <div className="apl-card space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Send Recruiter Invitation
            </h3>
            <p className="text-xs text-[#8A8F76] mt-1">
              Invite a new recruiter via email. They will receive an expiring link to set up their password and join your company.
            </p>
          </div>

          <form onSubmit={handleInviteRecruiter} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#52564A] dark:text-[#9CA485] mb-1">
                Recruiter Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading || !inviteEmail.trim()}
              className="w-full apl-btn apl-btn-primary py-2 px-4 text-xs font-bold shadow-xs"
            >
              {inviteLoading ? "Sending Email..." : "+ Send Invitation Link"}
            </button>
          </form>
        </div>

        {/* Card 2: Grant HR Permissions to existing member */}
        <div className="apl-card space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Grant HR / Recruiter Privileges
            </h3>
            <p className="text-xs text-[#8A8F76] mt-1">
              Assign HR privileges to existing company team members to grant them posting and candidate management capabilities.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedUserId) handleAddHR(selectedUserId);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-[#52564A] dark:text-[#9CA485] mb-1">
                Select Team Member
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                disabled={actionLoading || nonHRMembers.length === 0}
              >
                <option value="">
                  {nonHRMembers.length === 0
                    ? "All team members currently have HR status"
                    : "-- Select team member --"}
                </option>
                {nonHRMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.username || m.email || `User #${m.id}`} (ID: {m.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedUserId || actionLoading}
              className="w-full apl-btn apl-btn-secondary py-2 px-4 text-xs font-bold shadow-xs"
            >
              {actionLoading ? "Processing..." : "Grant HR Privileges"}
            </button>
          </form>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="apl-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Recruiter Invitations
            </h3>
            <p className="text-xs text-[#8A8F76]">
              Pending and accepted invitation setup links dispatched by your company.
            </p>
          </div>
          <span className="text-xs font-bold text-[#8A8F76] bg-[#ECEEDF] dark:bg-[#2A2E1E] px-3 py-1 rounded-full">
            {invitations.length} Total
          </span>
        </div>

        {invitationsLoading ? (
          <div className="py-8 text-center text-xs text-[#8A8F76]">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8F76]">No recruiter invitations sent yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] text-[11px] font-extrabold uppercase text-[#8A8F76]">
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Invited By</th>
                  <th className="py-2.5 px-3">Sent Date</th>
                  <th className="py-2.5 px-3">Expires</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEDF] dark:divide-[#2A2E1E] text-xs">
                {invitations.map((inv) => {
                  const isPending = inv.status === "pending";
                  const isAccepted = inv.status === "accepted";

                  return (
                    <tr key={inv.id} className="hover:bg-[#ECEEDF]/20 dark:hover:bg-[#2A2E1E]/20 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#22241B] dark:text-[#EBF0DA]">
                        {inv.email}
                      </td>
                      <td className="py-3 px-3 text-[#8A8F76]">
                        {inv.invited_by_email || "Company Admin"}
                      </td>
                      <td className="py-3 px-3 text-[#8A8F76]">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-[#8A8F76]">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAccepted
                              ? "bg-green-500/15 text-green-700 dark:text-green-400"
                              : isPending
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {inv.status ? inv.status.toUpperCase() : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPending && (
                          <button
                            onClick={() => handleRevokeInvitation(inv.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recruiter Roster List */}
      <div className="apl-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
              Company Team Roster
            </h3>
            <p className="text-xs text-[#8A8F76]">
              All registered accounts active under your company organization.
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
