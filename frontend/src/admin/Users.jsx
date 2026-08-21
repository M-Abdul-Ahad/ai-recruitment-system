import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../api/admin";
import { getRoles } from "../api/admin";

/* ── Role pill colour map (matches DESIGN.md semantic colours) ── */
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
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      textTransform: "capitalize",
      whiteSpace: "nowrap",
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
const CancelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ALL_ROLES = ["applicant", "recruiter", "company_admin", "admin"];

const EMPTY_FORM = { email: "", username: "", password: "", role: "applicant", is_hr: false };

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [roles,      setRoles]      = useState([]);   // from roles table
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErr,    setFormErr]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [editId,     setEditId]     = useState(null);   // user id being edited inline
  const [editData,   setEditData]   = useState({});
  const [editErr,    setEditErr]    = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Initial fetch ── */
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Add user ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr(null);
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) { setFormErr("Password is required."); setSaving(false); return; }
      const res = await createUser(payload);
      setUsers((prev) => [...prev, res.data]);
      setForm(EMPTY_FORM);
      setShowAdd(false);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
        setFormErr(msgs);
      } else {
        setFormErr("Failed to create user.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Start inline edit ── */
  const startEdit = (user) => {
    setEditId(user.id);
    setEditData({ role: user.role, is_hr: user.is_hr });
    setEditErr(null);
  };

  /* ── Save inline edit ── */
  const saveEdit = async (userId) => {
    setEditErr(null);
    setSaving(true);
    try {
      const res = await updateUser(userId, editData);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      setEditId(null);
      setEditData({});
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
        setEditErr(msgs);
      } else {
        setEditErr("Failed to update user.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete user ── */
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

  /* ── Render ── */
  return (
    <div className="apl-animate-fade">
      {/* Page header */}
      <div className="apl-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="apl-page-title">User Management</h1>
          <p className="apl-page-sub">View, add, edit, delete users and assign their roles.</p>
        </div>
        <button
          id="admin-add-user-btn"
          className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setFormErr(null); setForm(EMPTY_FORM); }}
        >
          <PlusIcon />
          {showAdd ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User form */}
      {showAdd && (
        <div className="apl-card apl-animate-scale" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--apl-neutral-900)", marginBottom: "16px" }}>
            New User
          </h2>

          {formErr && (
            <div style={{ marginBottom: "14px", padding: "10px 14px", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)", borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)" }}>
              {formErr}
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              <div>
                <label className="apl-label" htmlFor="add-email">Email</label>
                <input id="add-email" className="apl-input" type="email" required placeholder="user@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="apl-label" htmlFor="add-username">Username</label>
                <input id="add-username" className="apl-input" type="text" required placeholder="username"
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="apl-label" htmlFor="add-password">Password</label>
                <input id="add-password" className="apl-input" type="password" required placeholder="Min 8 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="apl-label" htmlFor="add-role">Role</label>
                <select id="add-role" className="apl-select"
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "22px" }}>
                <input id="add-is-hr" type="checkbox"
                  checked={form.is_hr} onChange={(e) => setForm({ ...form, is_hr: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "var(--apl-dark)", cursor: "pointer" }} />
                <label htmlFor="add-is-hr" style={{ fontSize: "14px", color: "var(--apl-neutral-700)", cursor: "pointer", userSelect: "none" }}>HR User</label>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button id="add-user-submit" type="submit" className="apl-btn apl-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Create User"}
              </button>
              <button type="button" className="apl-btn apl-btn-secondary"
                onClick={() => { setShowAdd(false); setFormErr(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inline edit error */}
      {editErr && (
        <div style={{ marginBottom: "14px", padding: "10px 14px", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)", borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)" }}>
          {editErr}
        </div>
      )}

      {/* Table */}
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
                <th>HR</th>
                <th>Company</th>
                <th>Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editId === u.id;
                return (
                  <tr key={u.id}>
                    <td style={{ color: "var(--apl-neutral-500)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                      #{u.id}
                    </td>
                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                    <td style={{ color: "var(--apl-neutral-700)" }}>{u.email}</td>

                    {/* Role — editable when isEditing */}
                    <td>
                      {isEditing ? (
                        <select
                          id={`edit-role-${u.id}`}
                          className="apl-select"
                          style={{ minWidth: "140px", padding: "6px 10px", fontSize: "13px" }}
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>{r.replace("_", " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <RolePill role={u.role} />
                      )}
                    </td>

                    {/* HR flag — editable when isEditing */}
                    <td>
                      {isEditing ? (
                        <input
                          id={`edit-hr-${u.id}`}
                          type="checkbox"
                          checked={editData.is_hr}
                          onChange={(e) => setEditData({ ...editData, is_hr: e.target.checked })}
                          style={{ width: "16px", height: "16px", accentColor: "var(--apl-dark)", cursor: "pointer" }}
                        />
                      ) : (
                        <span style={{ fontSize: "12px", fontWeight: 600, color: u.is_hr ? "var(--apl-success)" : "var(--apl-neutral-500)" }}>
                          {u.is_hr ? "Yes" : "No"}
                        </span>
                      )}
                    </td>

                    <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>
                      {u.company_name ?? "—"}
                    </td>

                    <td>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: u.is_active ? "var(--apl-success)" : "var(--apl-danger)" }}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            id={`save-user-${u.id}`}
                            className="apl-btn apl-btn-primary"
                            style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                            onClick={() => saveEdit(u.id)}
                            disabled={saving}
                            title="Save changes"
                          >
                            <SaveIcon /> Save
                          </button>
                          <button
                            className="apl-btn apl-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => { setEditId(null); setEditData({}); setEditErr(null); }}
                            title="Cancel"
                          >
                            <CancelIcon /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            id={`edit-user-${u.id}`}
                            className="apl-btn apl-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                            onClick={() => startEdit(u)}
                            title="Edit user"
                          >
                            <EditIcon /> Edit
                          </button>
                          <button
                            id={`delete-user-${u.id}`}
                            className="apl-btn apl-btn-danger"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            title="Delete user"
                          >
                            <TrashIcon />
                            {deletingId === u.id ? "…" : "Delete"}
                          </button>
                        </>
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
  );
}