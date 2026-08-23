import api from './axios';

// ─── Recruiter APIs ───
export const getJobs = () => api.get('/jobs/');

export const createJob = (data) => api.post('/jobs/', data);

export const generateJd = (data) => api.post('/jobs/generate-jd/', data);

export const updateJob = (id, data) => api.patch(`/jobs/${id}/`, data);

export const deleteJob = (id) => api.delete(`/jobs/${id}/`);

export const publishJob = (id) => api.post(`/jobs/${id}/publish/`);

export const closeJob = (id) => api.post(`/jobs/${id}/close/`);

export const getSkills = () => api.get('/jobs/skills/');

export const getApplicants = (jobId) => api.get(`/jobs/${jobId}/applications/`);

export const updateApplicantStatus = (jobId, appId, status) => 
  api.patch(`/jobs/${jobId}/applications/${appId}/`, { status });

/** PATCH /api/jobs/:id/applications/:appId/ → update status + recruiter_notes */
export const updateApplicationDetails = (jobId, appId, data) =>
  api.patch(`/jobs/${jobId}/applications/${appId}/`, data);

/**
 * POST /api/jobs/:jobId/bulk-upload-resumes/
 * Uploads multiple resume files (PDF/DOCX) for a job as recruiter-sourced candidates.
 * @param {number} jobId
 * @param {File[]} files
 * @param {function} onUploadProgress - axios upload progress callback
 */
export const bulkUploadResumes = (jobId, files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return api.post(`/jobs/${jobId}/bulk-upload-resumes/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// ─── Applicant APIs ───

/** GET /api/jobs/:id/ → full job detail (applicant view) */
export const getJobDetail = (id) => api.get(`/jobs/${id}/`);

/** POST /api/jobs/:id/apply/ → apply with optional resume_id */
export const applyToJob = (jobId, data = {}) => api.post(`/jobs/${jobId}/apply/`, data);

/** GET /api/jobs/my-applications/ → applicant's applications list */
export const getMyApplications = () => api.get('/jobs/my-applications/');

/** GET /api/resumes/my-resumes/ → applicant's uploaded resumes */
export const getMyResumes = () => api.get('/resumes/my-resumes/');

/** POST /api/resumes/upload/ → upload a new resume PDF/DOCX */
export const uploadResume = (formData) =>
  api.post('/resumes/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

