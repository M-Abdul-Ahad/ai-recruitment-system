import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useToast, Alert, Pagination } from "../components/ui";
import api from "../api/axios";

/* ── Inline SVG Icons ── */
const RecruiterIcons = {
  UserPlus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

export default function RecruiterManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  
  // Search query for team roster
  const [searchQuery, setSearchQuery] = useState("");

  // Invitations pagination
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);
  const [invTotalCount, setInvTotalCount] = useState(0);
  const [invTotalPages, setInvTotalPages] = useState(1);

  // Members pagination
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [memberTotalCount, setMemberTotalCount] = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchMembers = async (targetPage = memberPage, targetSize = memberPageSize) => {
    setLoading(true);
    try {
      const res = await api.get("/companies/members/", {
        params: { page: targetPage, page_size: targetSize },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setMembers(list);
      setMemberTotalCount(res.data?.count ?? list.length);
      setMemberTotalPages(res.data?.total_pages ?? Math.max(1, Math.ceil((res.data?.count ?? list.length) / targetSize)));
      setMemberPage(targetPage);
    } catch (err) {
      console.error("Failed to fetch company members:", err);
      setError("Could not load company members.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async (targetPage = invPage, targetSize = invPageSize) => {
    setInvitationsLoading(true);
    try {
      const res = await api.get("/companies/invitations/", {
        params: { page: targetPage, page_size: targetSize },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setInvitations(list);
      setInvTotalCount(res.data?.count ?? list.length);
      setInvTotalPages(res.data?.total_pages ?? Math.max(1, Math.ceil((res.data?.count ?? list.length) / targetSize)));
      setInvPage(targetPage);
    } catch (err) {
      console.error("Failed to fetch recruiter invitations:", err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1, memberPageSize);
    fetchInvitations(1, invPageSize);
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
        const msg = `Invitation record created for ${inviteEmail.trim()}, but email delivery failed: ${
          res.data.email_error || "Please check SMTP configuration"
        }.`;
        setError(msg);
        toast.warning(msg);
      } else {
        const msg = `Invitation successfully sent to ${inviteEmail.trim()}. A secure password setup link has been emailed.`;
        setSuccess(msg);
        toast.success(msg);
      }
      setInviteEmail("");
      await fetchInvitations(1, invPageSize);
      await fetchMembers(1, memberPageSize);
    } catch (err) {
      console.error("Invite recruiter error:", err);
      const msg = err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        "Failed to send recruiter invitation.";
      setError(msg);
      toast.error(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId, targetEmail) => {
    if (!window.confirm(`Are you sure you want to revoke the invitation for ${targetEmail || "this recruiter"}?`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await api.delete(`/companies/invitations/${invitationId}/`);
      setSuccess("Invitation revoked successfully.");
      toast.success("Invitation revoked successfully.");
      await fetchInvitations(invPage, invPageSize);
    } catch (err) {
      console.error("Revoke invitation error:", err);
      const msg = err.response?.data?.detail || "Failed to revoke invitation.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName || "this recruiter"} from your company team? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoadingId(memberId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/companies/members/${memberId}/`);
      setSuccess("Recruiter removed from company roster successfully.");
      toast.success("Recruiter removed from company roster.");
      await fetchMembers(memberPage, memberPageSize);
    } catch (err) {
      console.error("Delete recruiter error:", err);
      const msg = err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to delete recruiter.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Filter members by query (for quick client-side filtering of current page)
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.email?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.first_name?.toLowerCase().includes(q) ||
        m.last_name?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  return (
    <div className="apl-animate-fade max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--apl-neutral-100)] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] mb-1.5 uppercase tracking-wider">
            <RecruiterIcons.Users />
            Organization Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--apl-neutral-900)] tracking-tight">
            Recruiter & Team Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--apl-neutral-500)] mt-1">
            Authorize team members, dispatch invitation links, and manage recruiter permissions.
          </p>
        </div>
      </div>

      {/* ── Alert Messages ── */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess("")} />
      )}

      {/* ── Card 1: Invite Recruiter via Email ── */}
      <div className="apl-card space-y-4 border-l-4 border-l-[#D4DE95]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D4127] text-[#D4DE95] flex items-center justify-center shrink-0 shadow-xs">
            <RecruiterIcons.UserPlus />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--apl-neutral-900)]">
              Invite New Recruiter / HR
            </h3>
            <p className="text-xs text-[var(--apl-neutral-500)] mt-0.5">
              Enter the corporate email of your colleague. An expiring, secure password setup link will be generated and dispatched.
            </p>
          </div>
        </div>

        <form onSubmit={handleInviteRecruiter} className="pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apl-neutral-500)] pointer-events-none">
                <RecruiterIcons.Mail />
              </span>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@yourcompany.com"
                className="apl-input pl-10 text-xs sm:text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading || !inviteEmail.trim()}
              className="apl-btn apl-btn-primary py-2.5 px-5 text-xs font-bold shadow-xs whitespace-nowrap"
            >
              {inviteLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-[var(--apl-dark)] border-t-transparent rounded-full animate-spin" />
                  Sending Link...
                </span>
              ) : (
                "+ Send Invitation Link"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Card 2: Pending Invitations ── */}
      <div className="apl-card space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--apl-neutral-100)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)] flex items-center justify-center">
              <RecruiterIcons.Clock />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--apl-neutral-900)]">
                Dispatched Invitations
              </h3>
              <p className="text-xs text-[var(--apl-neutral-500)]">
                Pending and accepted onboarding links
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[var(--apl-neutral-700)] bg-[var(--apl-neutral-100)] px-3 py-1 rounded-full">
            {invTotalCount} Total
          </span>
        </div>

        {invitationsLoading ? (
          <div className="py-8 text-center text-xs text-[var(--apl-neutral-500)]">
            Loading invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--apl-neutral-500)] space-y-1">
            <p className="font-semibold">No active invitations dispatched yet.</p>
            <p className="text-[11px]">Use the form above to invite team members.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--apl-neutral-100)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--apl-neutral-bg)] border-b border-[var(--apl-neutral-100)] text-[11px] font-extrabold uppercase text-[var(--apl-neutral-500)] tracking-wider">
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Invited By</th>
                    <th className="py-3 px-4">Sent Date</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--apl-neutral-100)] text-xs">
                  {invitations.map((inv) => {
                    const isPending = inv.status === "pending";
                    const isAccepted = inv.status === "accepted";

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-[var(--apl-neutral-bg)] transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-[var(--apl-neutral-900)]">
                          {inv.email}
                        </td>
                        <td className="py-3 px-4 text-[var(--apl-neutral-500)]">
                          {inv.invited_by_email || "Company Admin"}
                        </td>
                        <td className="py-3 px-4 text-[var(--apl-neutral-500)] font-mono text-[11px]">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--apl-neutral-500)] font-mono text-[11px]">
                          {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isAccepted
                                ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                                : isPending
                                ? "bg-[#C99A3E]/15 text-[#C99A3E]"
                                : "bg-[#B4453D]/15 text-[#B4453D]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAccepted ? "bg-[#4E7A33]" : isPending ? "bg-[#C99A3E]" : "bg-[#B4453D]"
                              }`}
                            />
                            {inv.status ? inv.status.toUpperCase() : "PENDING"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending && (
                            <button
                              onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                              className="text-xs text-[#B4453D] hover:text-red-700 font-bold px-2.5 py-1 rounded-lg hover:bg-[#B4453D]/10 transition-colors inline-flex items-center gap-1"
                            >
                              <RecruiterIcons.XCircle />
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

            <Pagination
              currentPage={invPage}
              totalPages={invTotalPages}
              totalCount={invTotalCount}
              pageSize={invPageSize}
              onPageChange={(p) => fetchInvitations(p, invPageSize)}
              onPageSizeChange={(newSize) => {
                setInvPageSize(newSize);
                fetchInvitations(1, newSize);
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </>
        )}
      </div>

      {/* ── Card 3: Company Team Roster ── */}
      <div className="apl-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--apl-neutral-100)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3D4127] text-[#D4DE95] flex items-center justify-center">
              <RecruiterIcons.Users />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--apl-neutral-900)]">
                Active Team Roster
              </h3>
              <p className="text-xs text-[var(--apl-neutral-500)]">
                Recruiters and admins currently assigned to your company
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--apl-neutral-500)] pointer-events-none">
                <RecruiterIcons.Search />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter members..."
                className="apl-input pl-9 pr-3 py-1.5 text-xs w-48 sm:w-56"
              />
            </div>
            <span className="text-xs font-bold text-[var(--apl-neutral-700)] bg-[var(--apl-neutral-100)] px-3 py-1 rounded-full whitespace-nowrap">
              {memberTotalCount} Total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--apl-neutral-500)]">
            Loading team roster...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--apl-neutral-500)]">
            {searchQuery ? "No team members match your filter." : "No team members registered yet."}
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--apl-neutral-100)]">
              {filteredMembers.map((member) => {
                const isSelf = member.id === currentUser?.id;
                const isCA = member.role === "company_admin";

                return (
                  <div
                    key={member.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--apl-neutral-bg)]/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[var(--apl-sb-bg)] text-[#D4DE95] font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {(member.username || member.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[var(--apl-neutral-900)]">
                            {member.first_name
                              ? `${member.first_name} ${member.last_name || ""}`.trim()
                              : member.username || member.email}
                          </h4>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#D4DE95] text-[#3D4127]">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--apl-neutral-500)] mt-0.5">
                          {member.email} &bull; <span className="font-mono text-[11px]">ID: #{member.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isCA
                            ? "bg-[#D4DE95]/25 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/40"
                            : member.is_hr
                            ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                            : "bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCA ? "bg-[#3D4127] dark:bg-[#D4DE95]" : member.is_hr ? "bg-[#4E7A33]" : "bg-gray-400"
                          }`}
                        />
                        {isCA ? "Company Admin" : member.is_hr ? "HR / Recruiter Active" : member.role || "Member"}
                      </span>

                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteMember(member.id, member.username || member.email)}
                          disabled={deleteLoadingId === member.id}
                          className="text-xs text-[#B4453D] hover:text-red-700 font-bold px-3 py-1 rounded-lg hover:bg-[#B4453D]/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <RecruiterIcons.Trash />
                          {deleteLoadingId === member.id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={memberPage}
              totalPages={memberTotalPages}
              totalCount={memberTotalCount}
              pageSize={memberPageSize}
              onPageChange={(p) => fetchMembers(p, memberPageSize)}
              onPageSizeChange={(newSize) => {
                setMemberPageSize(newSize);
                fetchMembers(1, newSize);
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </>
        )}
      </div>
    </div>
  );
}
