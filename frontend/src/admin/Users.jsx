import { useState, useEffect } from "react";
import {
  getUsers, createUser, updateUser, deleteUser,
  getCompanies,
} from "../api/admin";

/* ── Role pill colour map ── */
const ROLE_PILL = {
  admin:         { bg: "var(--apl-accent)",      color: "var(--apl-dark)"    },
  recruiter:     { bg: "var(--apl-info-bg)",     color: "var(--apl-info)"    },
  company_admin: { bg: "var(--apl-warning-bg)",  color: "var(--apl-warning)" },
  applicant:     { bg: "var(--apl-success-bg)",  color: "var(--apl-success)" },
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
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ALL_ROLES = ["applicant", "recruiter", "company_admin", "admin"];
const COMPANY_ROLES = ["recruiter", "company_admin"];

const EMPTY_ADD_FORM = {
  email: "", username: "", password: "", role: "applicant", company: "",
};

const ErrBanner = ({ msg }) => msg ? (
  <div style={{
    marginBottom: "14px", padding: "10px 14px",
    background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)",
    borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)",
  }}>
    {msg}
  </div>
) : null;

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label className="apl-label" htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
);

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [companies,  setCompanies]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Add form state
  const [showAdd,    setShowAdd]    = useState(false);
  const [addForm,    setAddForm]    = useState(EMPTY_ADD_FORM);
  const [addErr,     setAddErr]     = useState(null);
  const [addSaving,  setAddSaving]  = useState(false);

  // Modal edit state
  const [editingUser, setEditingUser] = useState(null); // original user object being edited
  const [editForm,    setEditForm]    = useState({});
  const [editErr,     setEditErr]     = useState(null);
  const [editSaving,  setEditSaving]  = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

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

  const fmtErrors = (data) => {
    if (typeof data !== "object" || data === null) return "An error occurred.";
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" | ");
  };

  /* ── Add User ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddErr(null);
    if (COMPANY_ROLES.includes(addForm.role) && !addForm.company) {
      setAddErr("A company is required for this role.");
      return;
    }
    setAddSaving(true);
    try {
      const payload = { ...addForm };
      if (!payload.company) delete payload.company;
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

  /* ── Open Edit Modal ── */
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      email:     user.email      ?? "",
      username:  user.username   ?? "",
      role:      user.role       ?? "applicant",
      company:   user.company    ?? "",
      is_active: user.is_active  ?? true,
      password:  "",
    });
    setEditErr(null);
  };

  /* ── Close Edit Modal ── */
  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({});
    setEditErr(null);
  };

  /* ── Save Edit ── */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditErr(null);
    if (COMPANY_ROLES.includes(editForm.role) && !editForm.company) {
      setEditErr("A company is required for this role.");
      return;
    }
    setEditSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.company) delete payload.company;
      if (!payload.password) delete payload.password;
      const res = await updateUser(editingUser.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)));
      closeEditModal();
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
          type="button"
          className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setAddErr(null); setAddForm(EMPTY_ADD_FORM); }}
        >
          <PlusIcon />
          {showAdd ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* ─── Add User Card ─── */}
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

      {/* ─── Users Table ─── */}
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
              {users.map((u) => (
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
                    <button
                      id={`edit-user-${u.id}`}
                      type="button"
                      className="apl-btn apl-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                      onClick={() => openEditModal(u)}
                    >
                      <EditIcon /> Edit
                    </button>
                    <button
                      id={`delete-user-${u.id}`}
                      type="button"
                      className="apl-btn apl-btn-danger"
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                    >
                      <TrashIcon /> {deletingId === u.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Edit User Modal ─── */}
      {editingUser !== null && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000, background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          onClick={closeEditModal}
        >
          <div
            className="apl-card apl-animate-scale"
            style={{
              width: "100%", maxWidth: "560px", maxHeight: "90vh",
              overflowY: "auto", padding: "0", background: "var(--apl-bg-surface, #ffffff)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              borderRadius: "14px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid var(--apl-neutral-200, #EAEBE4)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--apl-neutral-900)" }}>
                  Edit User #{editingUser.id}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--apl-neutral-500)" }}>{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--apl-neutral-500)", padding: "4px", display: "flex",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit}>
              <div style={{ padding: "20px 24px" }}>
                <ErrBanner msg={editErr} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <Field label="Username" htmlFor="modal-edit-username">
                    <input id="modal-edit-username" className="apl-input" type="text" required
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                  </Field>
                  <Field label="Email" htmlFor="modal-edit-email">
                    <input id="modal-edit-email" className="apl-input" type="email" required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </Field>
                  <Field label="New Password" htmlFor="modal-edit-password">
                    <input id="modal-edit-password" className="apl-input" type="password"
                      placeholder="Leave blank to keep current"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  </Field>
                  <Field label="Role" htmlFor="modal-edit-role">
                    <select id="modal-edit-role" className="apl-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value, company: "" })}>
                      {ALL_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </Field>
                  {needsCompany(editForm.role) && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Company *" htmlFor="modal-edit-company">
                        <select id="modal-edit-company" className="apl-select" required
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}>
                          <option value="">— Select company —</option>
                          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}
                  <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "10px", paddingTop: "4px" }}>
                    <input
                      id="modal-edit-active"
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "var(--apl-dark)", cursor: "pointer" }}
                    />
                    <label htmlFor="modal-edit-active"
                      style={{ fontSize: "14px", color: "var(--apl-neutral-700)", cursor: "pointer", userSelect: "none" }}>
                      Account Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: "14px 24px", borderTop: "1px solid var(--apl-neutral-200, #EAEBE4)",
                display: "flex", justifyContent: "flex-end", gap: "10px",
                background: "var(--apl-neutral-50, #F9FAF7)", borderRadius: "0 0 14px 14px",
              }}>
                <button
                  type="button"
                  className="apl-btn apl-btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  id="modal-save-user-btn"
                  type="submit"
                  className="apl-btn apl-btn-primary"
                  disabled={editSaving}
                >
                  <SaveIcon /> {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}