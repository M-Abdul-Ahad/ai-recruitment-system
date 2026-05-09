import React, { useEffect, useState } from "react";
import { createJob, getSkills, updateJob } from "../../api/jobs";

const formatApiError = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.error === "string") return data.error;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => `${field}: ${item}`);
    }
    if (typeof value === "string") {
      return `${field}: ${value}`;
    }
    return [];
  });

  return messages.length ? messages.join(" ") : fallback;
};

export default function JobFormModal({ isOpen, onClose, onJobSaved, jobToEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    experience_required: 0,
    location: "",
    salary_min: "",
    salary_max: "",
    skills: [],
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchSkills();
    setError(null);
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || "",
        description: jobToEdit.description || "",
        experience_required: jobToEdit.experience_required || 0,
        location: jobToEdit.location || "",
        salary_min: jobToEdit.salary_min || "",
        salary_max: jobToEdit.salary_max || "",
        skills: jobToEdit.skills || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        experience_required: 0,
        location: "",
        salary_min: "",
        salary_max: "",
        skills: [],
      });
    }
  }, [isOpen, jobToEdit]);

  const fetchSkills = async () => {
    try {
      const response = await getSkills();
      setAvailableSkills(response.data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        experience_required: parseInt(formData.experience_required, 10) || 0,
        salary_min: formData.salary_min ? parseInt(formData.salary_min, 10) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max, 10) : null,
      };
      const response = jobToEdit
        ? await updateJob(jobToEdit.id, payload)
        : await createJob(payload);
      onJobSaved(response.data, !!jobToEdit);
      onClose();
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

  if (!isOpen) return null;

  const isEdit = !!jobToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-opacity">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#0f1021] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white">{isEdit ? "Edit Job" : "Create New Job"}</h2>
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error ? (
            <div className="mb-4 rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Job Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" placeholder="e.g. Senior Frontend Developer" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Description *</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" placeholder="Describe the role, responsibilities, and requirements..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" placeholder="e.g. New York, NY (or Remote)" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Experience Required (Years) *</label>
                <input type="number" min="0" name="experience_required" required value={formData.experience_required} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Min Salary</label>
                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" placeholder="e.g. 80000" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Max Salary</label>
                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none transition-all focus:border-violet-400/60" placeholder="e.g. 120000" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Skills Required (Select at least one for publishing)</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      formData.skills.includes(skill.id)
                        ? "border-violet-400/30 bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950"
                        : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/8"
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

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2 font-medium text-slate-300 transition-colors hover:bg-white/8">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 font-medium text-slate-950 transition hover:brightness-110 disabled:opacity-50">
              {loading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Job" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
