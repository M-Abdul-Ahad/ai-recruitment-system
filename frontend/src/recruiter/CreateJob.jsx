import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getMyCompany } from "../api/companies";
import { createJob, generateJd, getSkills, updateJob } from "../api/jobs";
import PortalShell from "../components/PortalShell";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company", end: true },
  { label: "Jobs Library", to: "/recruiter/jobs", end: true },
  { label: "Create Job", to: "/recruiter/jobs/create", end: true, tag: "AI" },
];

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

export default function CreateJob() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const jobToEdit = location.state?.jobToEdit;
  const [hasCompany, setHasCompany] = useState(true);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingJD, setIsGeneratingJD] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    experience_required: 0,
    location: "",
    salary_min: "",
    salary_max: "",
    skills: [],
    job_type: "",
    timings: "",
    experience_details: "",
    additional_requirements: "",
    jd_prompt: "",
  });

  useEffect(() => {
    fetchSkills();
    fetchCompanyStatus();
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || "",
        description: jobToEdit.description || "",
        experience_required: jobToEdit.experience_required || 0,
        location: jobToEdit.location || "",
        salary_min: jobToEdit.salary_min || "",
        salary_max: jobToEdit.salary_max || "",
        skills: jobToEdit.skills || [],
        job_type: jobToEdit.job_type || "",
        timings: jobToEdit.timings || "",
        experience_details: jobToEdit.experience_details || "",
        additional_requirements: jobToEdit.additional_requirements || "",
        jd_prompt: jobToEdit.jd_prompt || "",
      });
    }
  }, [jobToEdit]);

  const fetchCompanyStatus = async () => {
    try {
      await getMyCompany();
      setHasCompany(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasCompany(false);
      }
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await getSkills();
      setAvailableSkills(response.data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.includes(skillId)
        ? current.skills.filter((id) => id !== skillId)
        : [...current.skills, skillId],
    }));
  };

  const handleGenerateJD = async () => {
    setIsGeneratingJD(true);
    setError(null);
    try {
      const selectedSkillNames = availableSkills
        .filter((skill) => formData.skills.includes(skill.id))
        .map((skill) => skill.name);

      const payload = {
        title: formData.title,
        job_type: formData.job_type,
        location: formData.location,
        timings: formData.timings,
        experience_required: formData.experience_required,
        experience_details: formData.experience_details,
        skills: selectedSkillNames,
        additional_requirements: formData.additional_requirements,
        jd_prompt: formData.jd_prompt,
      };

      const response = await generateJd(payload);
      setFormData((current) => ({ ...current, description: response.data.generated_jd }));
    } catch (err) {
      console.error("JD Generation failed:", err);
      setError(err.response?.data?.error || "Failed to generate AI Job Description.");
    } finally {
      setIsGeneratingJD(false);
    }
  };

  const handleCopy = () => {
    if (!formData.description) return;
    navigator.clipboard.writeText(formData.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        experience_required: parseInt(formData.experience_required, 10) || 0,
        salary_min: formData.salary_min ? parseInt(formData.salary_min, 10) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max, 10) : null,
      };

      if (jobToEdit) {
        await updateJob(jobToEdit.id, payload);
      } else {
        await createJob(payload);
      }

      navigate("/recruiter/jobs");
    } catch (err) {
      console.error(err);
      setError(
        formatApiError(
          err.response?.data,
          `Failed to ${jobToEdit ? "update" : "create"} job. Please check the fields.`
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const isEdit = Boolean(jobToEdit);
  const selectedSkills = useMemo(
    () => availableSkills.filter((skill) => formData.skills.includes(skill.id)),
    [availableSkills, formData.skills]
  );

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge={isEdit ? "Edit job" : "Create job"}
      title="Build a polished role brief before it enters the hiring pipeline."
      subtitle="Shape the core job details, use AI to accelerate the first draft, and review the final posting in one recruiter workspace."
      navItems={recruiterNav}
      stats={[
        { value: hasCompany ? "Ready" : "Setup", label: "Company profile status" },
        { value: String(selectedSkills.length).padStart(2, "0"), label: "Skills attached to this role" },
        { value: formData.description ? "Drafted" : "Pending", label: "Description progress" },
        { value: isEdit ? "Edit" : "New", label: "Workflow mode" },
      ]}
    >
      {!hasCompany ? (
        <div className="mb-6 rounded-[30px] border border-amber-300/15 bg-amber-400/10 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Company setup required</div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Create your recruiter company profile first. The backend will block job creation until your account is linked to a company.
              </p>
            </div>
            <button
              onClick={() => navigate("/recruiter/company")}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Open Company Setup
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        <section className="col-span-12 space-y-6 xl:col-span-7">
          {error ? (
            <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm leading-7 text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white">
                1
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Role essentials</div>
                <p className="text-sm text-slate-400">Set the job title, location, experience band, and salary range.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                    placeholder="e.g. Remote or Karachi"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Experience Required (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    name="experience_required"
                    required
                    value={formData.experience_required}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Min Salary</label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                    placeholder="e.g. 80000"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Max Salary</label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Skills Required</label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        formData.skills.includes(skill.id)
                          ? "border-violet-400/30 bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                  {availableSkills.length === 0 ? (
                    <span className="text-sm italic text-slate-500">No skills available. Please add them in the admin panel.</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white">
                2
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Role context</div>
                <p className="text-sm text-slate-400">Add the job type, working hours, experience detail, and extra requirements.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
                  >
                    <option value="">Select job type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Timings</label>
                  <input
                    type="text"
                    name="timings"
                    value={formData.timings}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                    placeholder="e.g. 9 AM - 5 PM PST"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Experience Details</label>
                <textarea
                  name="experience_details"
                  rows="3"
                  value={formData.experience_details}
                  onChange={handleChange}
                  className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                  placeholder="e.g. Experience with production React systems, team collaboration, and shipping across the full sprint lifecycle."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Additional Requirements</label>
                <textarea
                  name="additional_requirements"
                  rows="4"
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                  placeholder="Nice to have: Docker, Kubernetes, stakeholder communication, design systems, or domain-specific experience."
                />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-300/12 bg-[linear-gradient(135deg,_rgba(22,24,46,0.96),_rgba(9,11,24,0.96))] p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                AI
              </div>
              <div>
                <div className="text-lg font-semibold text-white">AI job description generator</div>
                <p className="text-sm text-slate-400">Generate a first-pass brief, then refine the final description before publishing.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Additional AI Instructions</label>
                <textarea
                  name="jd_prompt"
                  rows="3"
                  value={formData.jd_prompt}
                  onChange={handleChange}
                  className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                  placeholder="Emphasize collaboration, measurable outcomes, product thinking, or role-specific expectations."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGenerateJD}
                  disabled={isGeneratingJD}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGeneratingJD ? "Generating..." : "Generate JD with AI"}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!formData.description}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:text-slate-500"
                >
                  {copied ? "Copied" : "Copy Draft"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 xl:col-span-5">
          <div className="xl:sticky xl:top-8 space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#111126] p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
                    Final Description
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {isEdit ? "Refine and update" : "Draft and publish"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/recruiter/jobs")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/[0.08]"
                >
                  Back
                </button>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">Job Description *</label>
                <textarea
                  name="description"
                  required
                  rows="16"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 font-mono text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                  placeholder="The final job description will appear here. You can edit the AI output before saving."
                />
              </div>

              <div className="mt-6 space-y-3 rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Draft Summary</div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Selected skills</span>
                  <span>{String(selectedSkills.length).padStart(2, "0")}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Description ready</span>
                  <span>{formData.description ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Mode</span>
                  <span>{isEdit ? "Editing" : "New role"}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || !hasCompany}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Job" : "Create Job"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/recruiter/jobs")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                Selected Skills
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSkills.length ? (
                  selectedSkills.map((skill) => (
                    <span key={skill.id} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills selected yet.</span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </form>
    </PortalShell>
  );
}
