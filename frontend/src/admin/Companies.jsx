import { useState, useEffect } from "react";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "../api/admin";

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

const EMPTY_FORM = { name: "", email: "", description: "", website: "", industry: "", phone: "", address: "" };

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

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErr, setAddErr] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErr, setEditErr] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getCompanies();
      setCompanies(res.data);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  const fmtErrors = (data) => {
    if (typeof data !== "object" || data === null) return "An error occurred.";
    return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
  };

  /* ── Add ── */
  const handleAdd = async (e) => {
    e.preventDefault(); setAddErr(null); setAddSaving(true);
    try {
      const res = await createCompany(addForm);
      setCompanies((prev) => [...prev, res.data]);
      setAddForm(EMPTY_FORM); setShowAdd(false);
    } catch (err) {
      setAddErr(fmtErrors(err.response?.data));
    } finally {
      setAddSaving(false);
    }
  };

  /* ── Start edit ── */
  const startEdit = (company) => {
    setEditId(company.id);
    setEditForm({
      name: company.name ?? "",
      email: company.email ?? "",
      description: company.description ?? "",
      website: company.website ?? "",
      industry: company.industry ?? "",
      phone: company.phone ?? "",
      address: company.address ?? "",
    });
    setEditErr(null);
  };

  /* ── Save edit ── */
  const saveEdit = async (e) => {
    e.preventDefault(); setEditErr(null); setEditSaving(true);
    try {
      const res = await updateCompany(editId, editForm);
      setCompanies((prev) => prev.map((c) => (c.id === editId ? res.data : c)));
      setEditId(null); setEditForm({});
    } catch (err) {
      setEditErr(fmtErrors(err.response?.data));
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? All associated jobs will also be deleted.")) return;
    setDeletingId(id);
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error ?? "Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="apl-animate-fade">
      {/* Page header */}
      <div className="apl-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="apl-page-title">Companies</h1>
          <p className="apl-page-sub">View, add, edit, and delete all registered companies.</p>
        </div>
        <button id="admin-add-company-btn" className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setAddErr(null); setAddForm(EMPTY_FORM); setEditId(null); }}>
          <PlusIcon /> {showAdd ? "Cancel" : "Add Company"}
        </button>
      </div>

      {/* ─── Add form ─── */}
      {showAdd && (
        <div className="apl-card apl-animate-scale" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--apl-neutral-900)", marginBottom: "16px" }}>New Company</h2>
          <ErrBanner msg={addErr} />
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              <Field label="Name *" htmlFor="add-co-name">
                <input id="add-co-name" className="apl-input" type="text" required placeholder="Company name"
                  value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </Field>
              <Field label="Email" htmlFor="add-co-email">
                <input id="add-co-email" className="apl-input" type="email" placeholder="contact@company.com"
                  value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </Field>
              <Field label="Industry" htmlFor="add-co-industry">
                <input id="add-co-industry" className="apl-input" type="text" placeholder="e.g. Technology"
                  value={addForm.industry} onChange={(e) => setAddForm({ ...addForm, industry: e.target.value })} />
              </Field>
              <Field label="Website" htmlFor="add-co-website">
                <input id="add-co-website" className="apl-input" type="url" placeholder="https://example.com"
                  value={addForm.website} onChange={(e) => setAddForm({ ...addForm, website: e.target.value })} />
              </Field>
              <Field label="Phone" htmlFor="add-co-phone">
                <input id="add-co-phone" className="apl-input" type="text" placeholder="+1-555-000-0000"
                  value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
              </Field>
              <Field label="Address" htmlFor="add-co-address">
                <input id="add-co-address" className="apl-input" type="text" placeholder="Street, City, Country"
                  value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Description" htmlFor="add-co-desc">
                  <textarea id="add-co-desc" className="apl-input" rows={3} placeholder="Brief description…"
                    style={{ resize: "vertical" }}
                    value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                </Field>
              </div>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button id="add-company-submit" type="submit" className="apl-btn apl-btn-primary" disabled={addSaving}>
                {addSaving ? "Saving…" : "Create Company"}
              </button>
              <button type="button" className="apl-btn apl-btn-secondary"
                onClick={() => { setShowAdd(false); setAddErr(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Table ─── */}
      {loading ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center", color: "var(--apl-neutral-500)" }}>Loading companies…</div>
      ) : error ? (
        <div className="apl-card" style={{ padding: "32px", textAlign: "center", color: "var(--apl-danger)", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)" }}>{error}</div>
      ) : companies.length === 0 ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--apl-neutral-500)", fontSize: "15px" }}>No companies found.</p>
        </div>
      ) : (
        <div className="apl-table-container" style={{ overflowX: "auto" }}>
          <table className="apl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Industry</th>
                <th>Email</th>
                <th>Website</th>
                <th>Phone</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const isEditing = editId === company.id;
                return (
                  <>
                    <tr key={company.id}>
                      <td style={{ color: "var(--apl-neutral-500)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                        #{company.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{company.name}</td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{company.industry || "—"}</td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{company.email || "—"}</td>
                      <td style={{ fontSize: "13px" }}>
                        {company.website
                          ? <a href={company.website} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--apl-info)", textDecoration: "none" }}>{company.website}</a>
                          : "—"}
                      </td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{company.phone || "—"}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isEditing ? (
                          <>
                            <button id={`edit-company-${company.id}`} className="apl-btn apl-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              onClick={() => startEdit(company)}>
                              <EditIcon /> Edit
                            </button>
                            <button id={`delete-company-${company.id}`} className="apl-btn apl-btn-danger"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => handleDelete(company.id)}
                              disabled={deletingId === company.id}>
                              <TrashIcon /> {deletingId === company.id ? "…" : "Delete"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button id={`save-company-${company.id}`} className="apl-btn apl-btn-primary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              form={`edit-company-form-${company.id}`} type="submit"
                              disabled={editSaving}>
                              <SaveIcon /> Save
                            </button>
                            <button className="apl-btn apl-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => { setEditId(null); setEditForm({}); setEditErr(null); }}>
                              <CancelIcon /> Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>

                    {/* ── Inline edit form row ── */}
                    {isEditing && (
                      <tr key={`edit-${company.id}`}>
                        <td colSpan={7} style={{ padding: "0", background: "var(--apl-neutral-50)" }}>
                          <div style={{ padding: "20px 24px" }}>
                            <ErrBanner msg={editErr} />
                            <form id={`edit-company-form-${company.id}`} onSubmit={saveEdit}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
                                <Field label="Name *" htmlFor={`edit-co-name-${company.id}`}>
                                  <input id={`edit-co-name-${company.id}`} className="apl-input" type="text" required
                                    value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                </Field>
                                <Field label="Email" htmlFor={`edit-co-email-${company.id}`}>
                                  <input id={`edit-co-email-${company.id}`} className="apl-input" type="email"
                                    value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                                </Field>
                                <Field label="Industry" htmlFor={`edit-co-industry-${company.id}`}>
                                  <input id={`edit-co-industry-${company.id}`} className="apl-input" type="text"
                                    value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} />
                                </Field>
                                <Field label="Website" htmlFor={`edit-co-website-${company.id}`}>
                                  <input id={`edit-co-website-${company.id}`} className="apl-input" type="url"
                                    value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
                                </Field>
                                <Field label="Phone" htmlFor={`edit-co-phone-${company.id}`}>
                                  <input id={`edit-co-phone-${company.id}`} className="apl-input" type="text"
                                    value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                                </Field>
                                <Field label="Address" htmlFor={`edit-co-address-${company.id}`}>
                                  <input id={`edit-co-address-${company.id}`} className="apl-input" type="text"
                                    value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                                </Field>
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <Field label="Description" htmlFor={`edit-co-desc-${company.id}`}>
                                    <textarea id={`edit-co-desc-${company.id}`} className="apl-input" rows={3}
                                      style={{ resize: "vertical" }}
                                      value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                  </Field>
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