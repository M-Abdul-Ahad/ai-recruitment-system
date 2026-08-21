import { useState, useEffect } from "react";
import { getJobs, createJob, updateJob, deleteJob, getCompanies, getSkills, getUsers } from "../api/admin";

/* ── Status pill ── */
const STATUS_PILL = {
  DRAFT: { bg: "var(--apl-neutral-100)", color: "var(--apl-neutral-700)" },
  ACTIVE: { bg: "var(--apl-success-bg)", color: "var(--apl-success)" },
  CLOSED: { bg: "var(--apl-danger-bg)", color: "var(--apl-danger)" },
};
const StatusPill = ({ status }) => {
  const style = STATUS_PILL[status] ?? STATUS_PILL.DRAFT;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "999px",
      fontSize: "12px", fontWeight: 600, background: style.bg, color: style.color,
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {status?.toLowerCase() ?? "draft"}
    </span>
  );
};

/* ── Icons ── */
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

const JOB_STATUSES = ["DRAFT", "ACTIVE", "CLOSED"];

const EMPTY_ADD = {
  title: "", description: "", company: "", created_by: "", status: "DRAFT",
  location: "", experience_required: "", salary_min: "", salary_max: "", skills: [],
};

const ErrBanner = ({ msg }) => msg ? (
  <div style={{
    marginBottom: "14px", padding: "10px 14px",
    background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)",
    borderRadius: "8px", fontSize: "13px", color: "var(--apl-danger)",
  }}>{msg}</div>
) : null;

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label className="apl-label" htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
);

/* ── Multi-select skill picker ── */
const SkillPicker = ({ allSkills, selected, onChange, prefix }) => {
  const toggle = (id) => {
    const num = Number(id);
    onChange(selected.includes(num) ? selected.filter((s) => s !== num) : [...selected, num]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
      {allSkills.map((s) => {
        const active = selected.includes(s.id);
        return (
          <button key={s.id} type="button"
            id={`${prefix}-skill-${s.id}`}
            onClick={() => toggle(s.id)}
            style={{
              padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              background: active ? "var(--apl-accent)" : "var(--apl-neutral-100)",
              color: active ? "var(--apl-dark)" : "var(--apl-neutral-700)",
              border: active ? "1px solid var(--apl-accent)" : "1px solid var(--apl-neutral-200)",
            }}>
            {s.name}
          </button>
        );
      })}
      {allSkills.length === 0 && <span style={{ fontSize: "13px", color: "var(--apl-neutral-500)" }}>No skills available</span>}
    </div>
  );
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [addErr, setAddErr] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErr, setEditErr] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [jobsRes, companiesRes, skillsRes, usersRes] = await Promise.all([
        getJobs(), getCompanies(), getSkills(), getUsers(),
      ]);
      setJobs(jobsRes.data);
      setCompanies(companiesRes.data);
      setAllSkills(skillsRes.data);
      setAllUsers(usersRes.data.filter((u) => ["recruiter", "company_admin", "admin"].includes(u.role)));
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const fmtErrors = (data) => {
    if (typeof data !== "object" || data === null) return "An error occurred.";
    return Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
  };

  const toIntOrNull = (v) => (v === "" || v === null || v === undefined) ? null : Number(v);

  /* ── Add ── */
  const handleAdd = async (e) => {
    e.preventDefault(); setAddErr(null); setAddSaving(true);
    try {
      const payload = {
        title: addForm.title,
        description: addForm.description,
        company: Number(addForm.company),
        created_by: Number(addForm.created_by),
        status: addForm.status,
        location: addForm.location,
        experience_required: Number(addForm.experience_required) || 0,
        salary_min: toIntOrNull(addForm.salary_min),
        salary_max: toIntOrNull(addForm.salary_max),
        skills: addForm.skills,
      };
      const res = await createJob(payload);
      setJobs((prev) => [res.data, ...prev]);
      setAddForm(EMPTY_ADD); setShowAdd(false);
    } catch (err) {
      setAddErr(fmtErrors(err.response?.data));
    } finally {
      setAddSaving(false);
    }
  };

  /* ── Start edit ── */
  const startEdit = (job) => {
    setEditId(job.id);
    setEditForm({
      title: job.title ?? "",
      description: job.description ?? "",
      status: job.status ?? "DRAFT",
      location: job.location ?? "",
      experience_required: job.experience_required ?? "",
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
      skills: (job.skills_data ?? []).map((s) => s.id),
    });
    setEditErr(null);
  };

  /* ── Save edit ── */
  const saveEdit = async (e) => {
    e.preventDefault(); setEditErr(null); setEditSaving(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        location: editForm.location,
        experience_required: Number(editForm.experience_required) || 0,
        salary_min: toIntOrNull(editForm.salary_min),
        salary_max: toIntOrNull(editForm.salary_max),
        skills: editForm.skills,
      };
      const res = await updateJob(editId, payload);
      setJobs((prev) => prev.map((j) => (j.id === editId ? res.data : j)));
      setEditId(null); setEditForm({});
    } catch (err) {
      setEditErr(fmtErrors(err.response?.data));
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job? All applications will also be deleted.")) return;
    setDeletingId(id);
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert(err.response?.data?.error ?? "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Reusable job form fields ── */
  const JobFields = ({ form, onChange, prefix }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
      <Field label="Title *" htmlFor={`${prefix}-title`}>
        <input id={`${prefix}-title`} className="apl-input" type="text" required
          value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} />
      </Field>
      <Field label="Status" htmlFor={`${prefix}-status`}>
        <select id={`${prefix}-status`} className="apl-select"
          value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value })}>
          {JOB_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </Field>
      <Field label="Location" htmlFor={`${prefix}-location`}>
        <input id={`${prefix}-location`} className="apl-input" type="text" placeholder="e.g. Remote, New York"
          value={form.location} onChange={(e) => onChange({ ...form, location: e.target.value })} />
      </Field>
      <Field label="Experience (years)" htmlFor={`${prefix}-exp`}>
        <input id={`${prefix}-exp`} className="apl-input" type="number" min="0" placeholder="0"
          value={form.experience_required} onChange={(e) => onChange({ ...form, experience_required: e.target.value })} />
      </Field>
      <Field label="Salary Min" htmlFor={`${prefix}-salmin`}>
        <input id={`${prefix}-salmin`} className="apl-input" type="number" min="0" placeholder="e.g. 50000"
          value={form.salary_min} onChange={(e) => onChange({ ...form, salary_min: e.target.value })} />
      </Field>
      <Field label="Salary Max" htmlFor={`${prefix}-salmax`}>
        <input id={`${prefix}-salmax`} className="apl-input" type="number" min="0" placeholder="e.g. 100000"
          value={form.salary_max} onChange={(e) => onChange({ ...form, salary_max: e.target.value })} />
      </Field>
      <div style={{ gridColumn: "1 / -1" }}>
        <Field label="Description *" htmlFor={`${prefix}-desc`}>
          <textarea id={`${prefix}-desc`} className="apl-input" rows={4} required placeholder="Job description…"
            style={{ resize: "vertical" }}
            value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} />
        </Field>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label className="apl-label">Skills</label>
        <SkillPicker allSkills={allSkills} selected={form.skills}
          onChange={(s) => onChange({ ...form, skills: s })} prefix={prefix} />
      </div>
    </div>
  );

  return (
    <div className="apl-animate-fade">
      {/* Page header */}
      <div className="apl-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="apl-page-title">Jobs</h1>
          <p className="apl-page-sub">View, add, edit, and delete all job postings.</p>
        </div>
        <button id="admin-add-job-btn" className="apl-btn apl-btn-primary"
          onClick={() => { setShowAdd((s) => !s); setAddErr(null); setAddForm(EMPTY_ADD); setEditId(null); }}>
          <PlusIcon /> {showAdd ? "Cancel" : "Add Job"}
        </button>
      </div>

      {/* ─── Add form ─── */}
      {showAdd && (
        <div className="apl-card apl-animate-scale" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--apl-neutral-900)", marginBottom: "16px" }}>New Job</h2>
          <ErrBanner msg={addErr} />
          <form onSubmit={handleAdd}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <Field label="Company *" htmlFor="add-job-company">
                <select id="add-job-company" className="apl-select" required
                  value={addForm.company} onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}>
                  <option value="">— Select company —</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Posted By *" htmlFor="add-job-created-by">
                <select id="add-job-created-by" className="apl-select" required
                  value={addForm.created_by} onChange={(e) => setAddForm({ ...addForm, created_by: e.target.value })}>
                  <option value="">— Select user —</option>
                  {allUsers.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                </select>
              </Field>
            </div>
            <JobFields form={addForm} onChange={setAddForm} prefix="add-job" />
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button id="add-job-submit" type="submit" className="apl-btn apl-btn-primary" disabled={addSaving}>
                {addSaving ? "Saving…" : "Create Job"}
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
        <div className="apl-card" style={{ padding: "48px", textAlign: "center", color: "var(--apl-neutral-500)" }}>Loading jobs…</div>
      ) : error ? (
        <div className="apl-card" style={{ padding: "32px", textAlign: "center", color: "var(--apl-danger)", background: "var(--apl-danger-bg)", border: "1px solid rgba(180,69,61,0.2)" }}>{error}</div>
      ) : jobs.length === 0 ? (
        <div className="apl-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--apl-neutral-500)", fontSize: "15px" }}>No jobs found.</p>
        </div>
      ) : (
        <div className="apl-table-container" style={{ overflowX: "auto" }}>
          <table className="apl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Location</th>
                <th>Exp (yrs)</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const isEditing = editId === job.id;
                return (
                  <>
                    <tr key={job.id}>
                      <td style={{ color: "var(--apl-neutral-500)", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>#{job.id}</td>
                      <td style={{ fontWeight: 600 }}>{job.title}</td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>
                        {companies.find((c) => c.id === job.company)?.name ?? `#${job.company}`}
                      </td>
                      <td><StatusPill status={job.status} /></td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{job.location || "—"}</td>
                      <td style={{ color: "var(--apl-neutral-700)", fontSize: "13px" }}>{job.experience_required ?? "—"}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {!isEditing ? (
                          <>
                            <button id={`edit-job-${job.id}`} className="apl-btn apl-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              onClick={() => startEdit(job)}>
                              <EditIcon /> Edit
                            </button>
                            <button id={`delete-job-${job.id}`} className="apl-btn apl-btn-danger"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={() => handleDelete(job.id)}
                              disabled={deletingId === job.id}>
                              <TrashIcon /> {deletingId === job.id ? "…" : "Delete"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button id={`save-job-${job.id}`} className="apl-btn apl-btn-primary"
                              style={{ padding: "6px 12px", fontSize: "13px", marginRight: "6px" }}
                              form={`edit-job-form-${job.id}`} type="submit"
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
                      <tr key={`edit-${job.id}`}>
                        <td colSpan={7} style={{ padding: "0", background: "var(--apl-neutral-50)" }}>
                          <div style={{ padding: "20px 24px" }}>
                            <ErrBanner msg={editErr} />
                            <form id={`edit-job-form-${job.id}`} onSubmit={saveEdit}>
                              <JobFields form={editForm} onChange={setEditForm} prefix={`edit-job-${job.id}`} />
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