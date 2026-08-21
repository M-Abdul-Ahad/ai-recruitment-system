import { useState, useEffect } from "react";
import {
  getUsers, createUser, updateUser, deleteUser,
  getCompanies,
} from "../api/admin";

/* ── Role pill colour map ── */
const ROLE_PILL = {
  admin: { bg: "var(--apl-accent)", color: "var(--apl-dark)" },
  recruiter: { bg: "var(--apl-info-bg)", color: "var(--apl-info)" },
  company_admin: { bg: "var(--apl-warning-bg)", color: "var(--apl-warning)" },
  applicant: { bg: "var(--apl-success-bg)", color: "var(--apl-success)" },
};

const RolePill = ({ role }) => {
  const style = ROLE_PILL[role] ?? { bg: "var(--apl-neutral-100)", color: "var(--apl-neutral-700)" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "999px",
      fontSize: "12px", fontWeight: 600, background: style.bg, color: style.color,
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {role?.replace("_", " ") ?? "—"}
    </span>
  );
};

/* ── Inline SVG icons ── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const CancelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ALL_ROLES = ["applicant", "recruiter", "company_admin", "admin"];
/* Roles that require a company association */
const COMPANY_ROLES = ["recruiter", "company_admin"];

const EMPTY_ADD_FORM = {
  email: "", username: "", password: "", role: "applicant", company: "",
};

/* ── Shared error banner ── */
const ErrBanner = ({ msg }) => msg ? (
  <div style={{
    marginBottom: "14px", padding: "10px 14px",
    background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)",
    borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)",
  }}>
    {msg}
  </div>
) : null;

/* ── Field row helper ── */
const Field = ({ label, htmlFor, children }) => (
  <div>
    <label className="apl-label" htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addErr, setAddErr] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  // ── Edit form state (full-form below the row)
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErr, setEditErr] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // ── Delete state
  const [deletingId, setDeletingId] = useState(null);

  /* ── Initial fetch ── */
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [usersRes, companyRes] = await Promise.all([getUsers(), getCompanies()]);
      setUsers(usersRes.data);
      setCompanies(companyRes.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Format validation errors from DRF ── */
  const fmtErrors = (data) => {
    if (typeof data !== "object" || data === null) return "An error occurred.";
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" | ");
  };

  /* ── Add user ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddErr(null);
    // Company required for recruiter / company_admin
    if (COMPANY_ROLES.includes(addForm.role) && !addForm.company) {
      setAddErr("A company is required for this role.");
      return;
    }
    setAddSaving(true);
    try {
      const payload = { ...addForm };
      if (!payload.company) delete payload.company;  // don't send empty string
      const res = await createUser(payload);
      setUsers((prev) => [...prev, res.data]);
      setAddForm(EMPTY_ADD_FORM);
      setShowAdd(false);
    } catch (err) {
      setAddErr(fmtErrors(err.response?.data));
    } finally {
      setAddSaving(false);
    }
  };

  /* ── Start full edit ── */
  const startEdit = (user) => {
    setEditId(user.id);
    setEditForm({
      email: user.email ?? "",
      username: user.username ?? "",
      role: user.role ?? "applicant",
      company: user.company ?? "",
      is_active: user.is_active ?? true,
      password: "",             // blank = don't change
    });
    setEditErr(null);
  };

  /* ── Save full edit ── */
  const saveEdit = async (e) => {
    e.preventDefault();
    setEditErr(null);
    if (COMPANY_ROLES.includes(editForm.role) && !editForm.company) {
      setEditErr("A company is required for this role.");
      return;
    }
    setEditSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.company) delete payload.company;   // null-out if cleared
      if (!payload.password) delete payload.password; // don't send blank password
      const res = await updateUser(editId, payload);
      setUsers((prev) => prev.map((u) => (u.id === editId ? res.data : u)));
      setEditId(null);
      setEditForm({});
    } catch (err) {
      setEditErr(fmtErrors(err.response?.data));
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const needsCompany = (role) => COMPANY_ROLES.includes(role);

  /* ── Render ── */
  return (
    <div className="apl-animate-fade">
      {/* Page header */}
      <div className="apl-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="apl-page-title">User Management</h1>
          <p className="apl-page-sub">View, add, edit, and delete users and assign their roles.</p>
        </div>
        <button
          id="admin-add-user-btn"
          className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setAddErr(null); setAddForm(EMPTY_ADD_FORM); setEditId(null); }}
        >
          <PlusIcon />
          {showAdd ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* ─── Add User form ─── */}
      {showAdd && (
        <div className="apl-card apl-animate-scale" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--apl-neutral-900)", marginBottom: "16px" }}>
            New User
          </h2>
          <ErrBanner msg={addErr} />
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              <Field label="Email" htmlFor="add-email">
                <input id="add-email" className="apl-input" type="email" required placeholder="user@example.com"
                  value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </Field>
              <Field label="Username" htmlFor="add-username">
                <input id="add-username" className="apl-input" type="text" required placeholder="username"
                  value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} />
              </Field>
              <Field label="Password" htmlFor="add-password">
                <input id="add-password" className="apl-input" type="password" required placeholder="Min 8 characters"
                  value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} />
              </Field>
              <Field label="Role" htmlFor="add-role">
                <select id="add-role" className="apl-select"
                  value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value, company: "" })}>
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
              </Field>
              {/* Company — only shown and required for recruiter/company_admin */}
              {needsCompany(addForm.role) && (
                <Field label="Company *" htmlFor="add-company">
                  <select id="add-company" className="apl-select" required
                    value={addForm.company} onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}>
                    <option value="">— Select company —</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button id="add-user-submit" type="submit" className="apl-btn apl-btn-primary" disabled={addSaving}>
                {addSaving ? "Saving…" : "Create User"}
              </button>
              <button type="button" className="apl-btn apl-btn-secondary"
                onClick={() => { setShowAdd(false); setAddErr(null); setAddForm(EMPTY_ADD_FORM); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Table ─── */}
      {loading ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center", color: "var(--apl-neutral-500)" }}>
          Loading users…
        </div>
      ) : error ? (
        <div className="apl-card" style={{ padding: "32px", textAlign: "center", color: "var(--apl-danger)", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)" }}>
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--apl-neutral-500)", fontSize: "15px" }}>No users found.</p>
        </div>
      ) : (
        <div className="apl-table-container" style={{ overflowX: "auto" }}>
          <table className="apl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editId === u.id;
                return (
                  <>
                    {/* ── Main row ── */}
                    <tr key={u.id}>
                      <td style={{ color: "var(--apl-neutral-500)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                        #{u.id}
                      </td>
                      <td style={{ fontWeight: 500 }}>{u.username}</td>
                      <td style={{ color: "var(--apl-neutral-700)" }}>{u.email}</td>
                      <td><RolePill role={u.role} /></td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{u.company_name ?? "—"}</td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: u.is_active ? "var(--apl-success)" : "var(--apl-danger)" }}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isEditing ? (
                          <>
                            <button
                              id={`edit-user-${u.id}`}
                              className="apl-btn apl-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              onClick={() => startEdit(u)}
                            >
                              <EditIcon /> Edit
                            </button>
                            <button
                              id={`delete-user-${u.id}`}
                              className="apl-btn apl-btn-danger"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => handleDelete(u.id)}
                              disabled={deletingId === u.id}
                            >
                              <TrashIcon /> {deletingId === u.id ? "…" : "Delete"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              id={`save-user-${u.id}`}
                              className="apl-btn apl-btn-primary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              form={`edit-form-${u.id}`}
                              type="submit"
                              disabled={editSaving}
                            >
                              <SaveIcon /> Save
                            </button>
                            <button
                              className="apl-btn apl-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => { setEditId(null); setEditForm({}); setEditErr(null); }}
                            >
                              <CancelIcon /> Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>

                    {/* ── Inline edit form row ── */}
                    {isEditing && (
                      <tr key={`edit-${u.id}`}>
                        <td colSpan={7} style={{ padding: "0", background: "var(--apl-neutral-50)" }}>
                          <div style={{ padding: "20px 24px" }}>
                            <ErrBanner msg={editErr} />
                            <form id={`edit-form-${u.id}`} onSubmit={saveEdit}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
                                <Field label="Username" htmlFor={`edit-username-${u.id}`}>
                                  <input id={`edit-username-${u.id}`} className="apl-input" type="text" required
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                                </Field>
                                <Field label="Email" htmlFor={`edit-email-${u.id}`}>
                                  <input id={`edit-email-${u.id}`} className="apl-input" type="email" required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                                </Field>
                                <Field label="New Password" htmlFor={`edit-password-${u.id}`}>
                                  <input id={`edit-password-${u.id}`} className="apl-input" type="password"
                                    placeholder="Leave blank to keep current"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                                </Field>
                                <Field label="Role" htmlFor={`edit-role-${u.id}`}>
                                  <select id={`edit-role-${u.id}`} className="apl-select"
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value, company: "" })}>
                                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                                  </select>
                                </Field>
                                {/* Company — only shown for recruiter/company_admin */}
                                {needsCompany(editForm.role) && (
                                  <Field label="Company *" htmlFor={`edit-company-${u.id}`}>
                                    <select id={`edit-company-${u.id}`} className="apl-select" required
                                      value={editForm.company}
                                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}>
                                      <option value="">— Select company —</option>
                                      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                  </Field>
                                )}
                                {/* Active toggle */}
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "22px" }}>
                                  <input
                                    id={`edit-active-${u.id}`}
                                    type="checkbox"
                                    checked={editForm.is_active}
                                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                    style={{ width: "16px", height: "16px", accentColor: "var(--apl-dark)", cursor: "pointer" }}
                                  />
                                  <label htmlFor={`edit-active-${u.id}`}
                                    style={{ fontSize: "14px", color: "var(--apl-neutral-700)", cursor: "pointer", userSelect: "none" }}>
                                    Active
                                  </label>
                                </div>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}