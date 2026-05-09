import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";
import { createCompany, getCompanyMembers, getMyCompany } from "../api/companies";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company" },
  { label: "Jobs Library", to: "/recruiter/jobs" },
  { label: "Create Job", to: "/recruiter/jobs/create", tag: "AI" },
];

const defaultForm = {
  name: "",
  description: "",
  website: "",
};

const formatApiError = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.error === "string") return data.error;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    if (Array.isArray(value)) return value.map((item) => `${field}: ${item}`);
    if (typeof value === "string") return `${field}: ${value}`;
    return [];
  });

  return messages.length ? messages.join(" ") : fallback;
};

export default function Company() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const companyResponse = await getMyCompany();
      setCompany(companyResponse.data);
      setError("");

      try {
        const membersResponse = await getCompanyMembers();
        setMembers(membersResponse.data);
      } catch (memberError) {
        console.error(memberError);
        setMembers([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCompany(null);
        setMembers([]);
        setError("");
      } else {
        setError(formatApiError(err.response?.data, "Failed to load company details."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await createCompany(formData);
      setCompany(response.data);
      setFormData(defaultForm);
      updateUser({ company: response.data.id, is_hr: true });
      const membersResponse = await getCompanyMembers();
      setMembers(membersResponse.data);
    } catch (err) {
      setError(formatApiError(err.response?.data, "Failed to create company."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Company"
      title="Set up your company before posting jobs."
      subtitle="Recruiters need a company profile to publish roles, manage HR access, and keep hiring activity linked to the right organization."
      navItems={recruiterNav}
      stats={[
        { value: company ? "Ready" : "Setup", label: "Company profile status" },
        { value: String(members.length).padStart(2, "0"), label: "Members linked" },
        { value: company ? "HR" : "--", label: "Recruiter access level" },
        { value: company ? "Live" : "Pending", label: "Job posting eligibility" },
      ]}
    >
      {loading ? (
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-slate-300">
          Loading company setup...
        </div>
      ) : company ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Company profile</div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{company.name}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {company.description || "No company description added yet."}
            </p>
            <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 px-5 py-4 text-sm text-slate-300">
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-cyan-200 underline-offset-4 hover:underline">
                  {company.website}
                </a>
              ) : (
                "No website added yet."
              )}
            </div>
            <button
              onClick={() => navigate("/recruiter")}
              className="mt-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Back to dashboard
            </button>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Team access</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">Recruiter members</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                {members.length} total
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {members.length ? members.map((member) => (
                <div key={member.id} className="rounded-[24px] border border-white/8 bg-black/20 px-5 py-4">
                  <div className="text-base font-semibold text-white">{member.username}</div>
                  <div className="mt-1 text-sm capitalize text-slate-400">
                    {member.role}{member.is_hr ? " • HR" : ""}
                  </div>
                </div>
              )) : (
                <div className="rounded-[24px] border border-white/8 bg-black/20 px-5 py-4 text-sm text-slate-400">
                  No members linked yet.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Why this matters</div>
            <h2 className="mt-4 text-3xl font-semibold text-white">Create your company profile to unlock job posting.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Every recruiter account must belong to a company. Once you create it here, you can return to the dashboard and immediately create jobs.
            </p>
            <div className="mt-6 space-y-4">
              {[
                "Link recruiters and HR access to one organization.",
                "Keep all job postings tied to the right employer brand.",
                "Enable candidate, hiring, and company-level workflows.",
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/8 bg-black/20 px-5 py-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Company setup</div>
            <h3 className="mt-3 text-2xl font-semibold text-white">Create company</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Add the company details once. Your recruiter account will be linked automatically.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleCreateCompany} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Company name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
                  placeholder="Acme Technologies"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
                  placeholder="What does your company do?"
                  rows="5"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Website</label>
                <input
                  value={formData.website}
                  onChange={(e) => setFormData((current) => ({ ...current, website: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
                  placeholder="https://yourcompany.com"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
              >
                {creating ? "Creating company..." : "Create company"}
              </button>
            </form>
          </section>
        </div>
      )}
    </PortalShell>
  );
}
