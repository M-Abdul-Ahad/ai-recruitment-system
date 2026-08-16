import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createJob, updateJob, getSkills, generateJd } from "../api/jobs";

const CreateJob = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobToEdit = location.state?.jobToEdit;

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

  const [availableSkills, setAvailableSkills] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingJD, setIsGeneratingJD] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkills();
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
    setFormData((prev) => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills };
    });
  };

  const handleGenerateJD = async () => {
    setIsGeneratingJD(true);
    setError(null);
    try {
      const selectedSkillNames = availableSkills
        .filter((s) => formData.skills.includes(s.id))
        .map((s) => s.name);

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
      setFormData((prev) => ({ ...prev, description: response.data.generated_jd }));
    } catch (err) {
      console.error("JD Generation failed:", err);
      setError(
        err.response?.data?.error || "Failed to generate AI Job Description."
      );
    } finally {
      setIsGeneratingJD(false);
    }
  };

  const handleCopy = () => {
    if (formData.description) {
      navigator.clipboard.writeText(formData.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        experience_required: parseInt(formData.experience_required) || 0,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
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
        err.response?.data?.error ||
          `Failed to ${jobToEdit ? "update" : "create"} job. Please check the fields.`
      );
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!jobToEdit;

  return (
    <div className="max-w-4xl mx-auto apl-animate-fade space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link to="/recruiter/jobs" className="text-xs font-bold text-[#3D4127] dark:text-[#D4DE95] hover:underline inline-flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Jobs
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">{isEdit ? "Edit Job Posting" : "Create New Job Posting"}</h1>
          <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">Fill out the details below to {isEdit ? "update the" : "create a"} job requisition.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-[#B4453D]/10 border border-[#B4453D]/20 text-[#B4453D] rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="apl-card">
          <h2 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-6 flex items-center">
            <span className="bg-[#D4DE95] text-[#3D4127] w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm font-extrabold shadow-xs">1</span>
            Basic Info
          </h2>
          <div className="space-y-5">
            <div>
              <label className="apl-label">Job Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="apl-input" placeholder="e.g. Senior Frontend Developer" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="apl-label">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="apl-input" placeholder="e.g. New York, NY (or Remote)" />
              </div>
              <div>
                <label className="apl-label">Experience Required (Years) *</label>
                <input type="number" min="0" name="experience_required" required value={formData.experience_required} onChange={handleChange} className="apl-input" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="apl-label">Min Salary ($)</label>
                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="apl-input" placeholder="e.g. 80000" />
              </div>
              <div>
                <label className="apl-label">Max Salary ($)</label>
                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="apl-input" placeholder="e.g. 120000" />
              </div>
            </div>
            <div>
              <label className="apl-label">Skills Required (Select at least one for publishing)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {availableSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-[#D4DE95] text-[#3D4127] border-[#3D4127]/20 shadow-xs"
                          : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] border-[#D3D6C4] dark:border-[#383D28] hover:bg-[#D3D6C4]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{skill.name}
                    </button>
                  );
                })}
                {availableSkills.length === 0 && (
                  <span className="text-[#8A8F76] text-xs italic">No skills available.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Job Details */}
        <div className="apl-card">
          <h2 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-6 flex items-center">
            <span className="bg-[#D4DE95] text-[#3D4127] w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm font-extrabold shadow-xs">2</span>
            Job Details
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="apl-label">Job Type</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="apl-select"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="apl-label">Timings</label>
                <input type="text" name="timings" value={formData.timings} onChange={handleChange} className="apl-input" placeholder="e.g. 9 AM - 5 PM EST" />
              </div>
            </div>
            <div>
              <label className="apl-label">Type of Experience Required</label>
              <textarea name="experience_details" rows="2" value={formData.experience_details} onChange={handleChange} className="apl-textarea resize-none" placeholder="e.g. Experience with high-traffic e-commerce systems..." />
            </div>
          </div>
        </div>

        {/* Section 3: Requirements */}
        <div className="apl-card">
          <h2 className="text-lg font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-6 flex items-center">
            <span className="bg-[#D4DE95] text-[#3D4127] w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm font-extrabold shadow-xs">3</span>
            Requirements
          </h2>
          <div>
            <label className="apl-label">Additional Skills / Technologies</label>
            <textarea name="additional_requirements" rows="3" value={formData.additional_requirements} onChange={handleChange} className="apl-textarea resize-none" placeholder="e.g. Nice to have: Docker, Kubernetes, AWS..." />
          </div>
        </div>

        {/* Section 4: AI JD Generator */}
        <div className="bg-[#D4DE95]/15 dark:bg-[#D4DE95]/5 rounded-2xl p-8 border border-[#D4DE95]/40 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[#3D4127] dark:text-[#D4DE95] flex items-center">
            <span className="bg-[#3D4127] text-[#D4DE95] w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm font-bold shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </span>
            AI Job Description Generator
          </h2>
          <div className="space-y-5">
            <div>
              <label className="apl-label">Additional Instructions for AI JD</label>
              <textarea name="jd_prompt" rows="2" value={formData.jd_prompt} onChange={handleChange} className="apl-textarea resize-none" placeholder="e.g. Emphasize teamwork, agile methodologies, and leadership potential." />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleGenerateJD} disabled={isGeneratingJD} className="apl-btn apl-btn-dark shadow-md disabled:opacity-50">
                {isGeneratingJD ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                )}
                {isGeneratingJD ? "Generating..." : "Generate AI JD"}
              </button>
              <button type="button" onClick={handleGenerateJD} disabled={isGeneratingJD} className="apl-btn apl-btn-secondary disabled:opacity-50">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Regenerate
              </button>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="apl-label">Final Job Description *</label>
                {formData.description && (
                  <button type="button" onClick={handleCopy} className="text-xs text-[#3D4127] dark:text-[#D4DE95] hover:underline flex items-center font-bold transition-colors">
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 mr-1 text-[#4E7A33]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea name="description" required rows="10" value={formData.description} onChange={handleChange} className="apl-textarea apl-font-mono text-xs resize-y" placeholder="The generated description will appear here. You can manually edit this text before saving." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 pb-12 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
          <Link to="/recruiter/jobs" className="apl-btn apl-btn-secondary px-6">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="apl-btn apl-btn-primary px-8 py-3 text-base shadow-md disabled:opacity-50">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#3D4127]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Job" : "Create Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;