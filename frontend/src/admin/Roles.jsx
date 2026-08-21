import { useState, useEffect } from "react";
import { getRoles, createRole, updateRole, deleteRole } from "../api/admin";

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

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [formErr, setFormErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editErr, setEditErr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Initial fetch ── */
  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Add role ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr(null);
    const name = newName.trim();
    if (!name) { setFormErr("Role name cannot be blank."); return; }
    setSaving(true);
    try {
      const res = await createRole({ name });
      setRoles((prev) => [...prev, res.data]);
      setNewName("");
      setShowAdd(false);
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) {
        setFormErr(Array.isArray(data.name) ? data.name.join(", ") : data.name);
      } else {
        setFormErr("Failed to create role.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Start inline edit ── */
  const startEdit = (role) => {
    setEditId(role.id);
    setEditName(role.name);
    setEditErr(null);
  };

  /* ── Save inline edit ── */
  const saveEdit = async (roleId) => {
    setEditErr(null);
    const name = editName.trim();
    if (!name) { setEditErr("Role name cannot be blank."); return; }
    setSaving(true);
    try {
      const res = await updateRole(roleId, { name });
      setRoles((prev) => prev.map((r) => (r.id === roleId ? res.data : r)));
      setEditId(null);
      setEditName("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) {
        setEditErr(Array.isArray(data.name) ? data.name.join(", ") : data.name);
      } else {
        setEditErr("Failed to update role.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete role ── */
  const handleDelete = async (roleId) => {
    if (!window.confirm("Delete this role? Users assigned to it will lose this role association.")) return;
    setDeletingId(roleId);
    try {
      await deleteRole(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err) {
      alert(err.response?.data?.error ?? "Failed to delete role.");
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
          <h1 className="apl-page-title">Role Management</h1>
          <p className="apl-page-sub">Create, rename, and delete roles from the system.</p>
        </div>
        <button
          id="admin-add-role-btn"
          className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setFormErr(null); setNewName(""); }}
        >
          <PlusIcon />
          {showAdd ? "Cancel" : "Add Role"}
        </button>
      </div>

      {/* Add role form */}
      {showAdd && (
        <div className="apl-card apl-animate-scale" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--apl-neutral-900)", marginBottom: "16px" }}>
            New Role
          </h2>

          {formErr && (
            <div style={{ marginBottom: "14px", padding: "10px 14px", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)", borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)" }}>
              {formErr}
            </div>
          )}

          <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: "320px" }}>
              <label className="apl-label" htmlFor="add-role-name">Role Name</label>
              <input
                id="add-role-name"
                className="apl-input"
                type="text"
                required
                placeholder="e.g. moderator"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <button id="add-role-submit" type="submit" className="apl-btn apl-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Create Role"}
            </button>
            <button type="button" className="apl-btn apl-btn-secondary"
              onClick={() => { setShowAdd(false); setFormErr(null); setNewName(""); }}>
              Cancel
            </button>
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
          Loading roles…
        </div>
      ) : error ? (
        <div className="apl-card" style={{ padding: "32px", textAlign: "center", color: "var(--apl-danger)", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)" }}>
          {error}
        </div>
      ) : roles.length === 0 ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--apl-neutral-500)", fontSize: "15px" }}>No roles found. Add one above.</p>
        </div>
      ) : (
        <div className="apl-table-container" style={{ overflowX: "auto" }}>
          <table className="apl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Role Name</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const isEditing = editId === role.id;
                return (
                  <tr key={role.id}>
                    <td style={{ color: "var(--apl-neutral-500)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", width: "80px" }}>
                      #{role.id}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          id={`edit-role-name-${role.id}`}
                          className="apl-input"
                          type="text"
                          style={{ maxWidth: "280px", padding: "6px 10px", fontSize: "13px" }}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "var(--apl-accent)",
                          color: "var(--apl-dark)",
                          textTransform: "capitalize",
                        }}>
                          {role.name}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {isEditing ? (
                        <>
                          <button
                            id={`save-role-${role.id}`}
                            className="apl-btn apl-btn-primary"
                            style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                            onClick={() => saveEdit(role.id)}
                            disabled={saving}
                            title="Save"
                          >
                            <SaveIcon /> Save
                          </button>
                          <button
                            className="apl-btn apl-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => { setEditId(null); setEditName(""); setEditErr(null); }}
                            title="Cancel"
                          >
                            <CancelIcon /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            id={`edit-role-${role.id}`}
                            className="apl-btn apl-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                            onClick={() => startEdit(role)}
                            title="Edit role"
                          >
                            <EditIcon /> Edit
                          </button>
                          <button
                            id={`delete-role-${role.id}`}
                            className="apl-btn apl-btn-danger"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            onClick={() => handleDelete(role.id)}
                            disabled={deletingId === role.id}
                            title="Delete role"
                          >
                            <TrashIcon />
                            {deletingId === role.id ? "…" : "Delete"}
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
