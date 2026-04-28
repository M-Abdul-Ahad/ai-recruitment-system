import React, { useState, useEffect } from 'react';
import { createJob, updateJob, getSkills } from '../../api/jobs';

const JobFormModal = ({ isOpen, onClose, onJobSaved, jobToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    experience_required: 0,
    location: '',
    salary_min: '',
    salary_max: '',
    skills: []
  });
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
      if (jobToEdit) {
        setFormData({
          title: jobToEdit.title || '',
          description: jobToEdit.description || '',
          experience_required: jobToEdit.experience_required || 0,
          location: jobToEdit.location || '',
          salary_min: jobToEdit.salary_min || '',
          salary_max: jobToEdit.salary_max || '',
          skills: jobToEdit.skills || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          experience_required: 0,
          location: '',
          salary_min: '',
          salary_max: '',
          skills: []
        });
      }
      setError(null);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills };
    });
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

      let response;
      if (jobToEdit) {
        response = await updateJob(jobToEdit.id, payload);
      } else {
        response = await createJob(payload);
      }
      
      onJobSaved(response.data, !!jobToEdit);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || `Failed to ${jobToEdit ? 'update' : 'create'} job. Please check the fields.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEdit = !!jobToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Job' : 'Create New Job'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Senior Frontend Developer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Describe the role, responsibilities, and requirements..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. New York, NY (or Remote)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required (Years) *</label>
                <input type="number" min="0" name="experience_required" required value={formData.experience_required} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 80000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 120000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required (Select at least one for publishing)</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.skills.includes(skill.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {skill.name}
                  </button>
                ))}
                {availableSkills.length === 0 && <span className="text-gray-400 text-sm italic">No skills available. Please add them in the admin panel.</span>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-200 transition-colors disabled:opacity-50">
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
