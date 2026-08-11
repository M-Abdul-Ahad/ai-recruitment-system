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
    <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/recruiter/jobs" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Jobs
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Job Posting" : "Create New Job Posting"}</h1>
            <p className="text-gray-500 mt-1">Fill out the details below to {isEdit ? "update the" : "create a"} job.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm">1</span>
              Basic Info
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Senior Frontend Developer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. New York, NY (or Remote)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required (Years) *</label>
                  <input type="number" min="0" name="experience_required" required value={formData.experience_required} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 80000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 120000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required (Select at least one for publishing)</label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        formData.skills.includes(skill.id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                  {availableSkills.length === 0 && (
                    <span className="text-gray-400 text-sm italic">No skills available.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm">2</span>
              Job Details
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timings</label>
                  <input type="text" name="timings" value={formData.timings} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 9 AM - 5 PM EST" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Experience Required</label>
                <textarea name="experience_details" rows="2" value={formData.experience_details} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="e.g. Experience with high-traffic e-commerce systems..." />
              </div>
            </div>
          </div>

          {/* Section 3: Requirements */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm">3</span>
              Requirements
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Skills / Technologies</label>
              <textarea name="additional_requirements" rows="3" value={formData.additional_requirements} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="e.g. Nice to have: Docker, Kubernetes, AWS..." />
            </div>
          </div>

          {/* Section 4: AI JD Generator */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm border border-blue-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
              AI Job Description Generator
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions for AI JD</label>
                <textarea name="jd_prompt" rows="2" value={formData.jd_prompt} onChange={handleChange} className="w-full px-4 py-2.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white" placeholder="e.g. Emphasize teamwork, agile methodologies, and leadership potential." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleGenerateJD} disabled={isGeneratingJD} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-colors flex items-center disabled:opacity-50">
                  {isGeneratingJD ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  )}
                  {isGeneratingJD ? "Generating..." : "Generate AI JD"}
                </button>
                <button type="button" onClick={handleGenerateJD} disabled={isGeneratingJD} className="px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl font-medium transition-colors flex items-center disabled:opacity-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Regenerate
                </button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Final Job Description *</label>
                  {formData.description && (
                    <button type="button" onClick={handleCopy} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-medium transition-colors">
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea name="description" required rows="10" value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y bg-white font-mono text-sm" placeholder="The generated description will appear here. You can manually edit this text before saving." />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-100 pt-8 pb-12">
            <Link to="/recruiter/jobs" className="px-6 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-colors shadow-sm">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-200 transition-colors disabled:opacity-50 flex items-center text-lg">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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