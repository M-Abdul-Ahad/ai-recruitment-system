import api from './axios';

// ─── Recruiter APIs ───
export const getJobs = () => api.get('/jobs/');

export const getDashboardStats = () => api.get('/jobs/dashboard-stats/');

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
 * DELETE /api/jobs/:jobId/applications/:appId/remove/
 * Removes a candidate's JobApplication. For recruiter-uploaded resumes,
 * also deletes the orphaned Resume record and file on the server.
 */
export const removeCandidate = (jobId, appId) =>
  api.delete(`/jobs/${jobId}/applications/${appId}/remove/`);

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

/**
 * POST /api/jobs/:jobId/stage-resumes/
 * Stages temporary resumes (PDF, DOCX, ZIP, folders) for shortlisting session.
 */
export const stageResumes = (jobId, formData, onUploadProgress) =>
  api.post(`/jobs/${jobId}/stage-resumes/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

/**
 * POST /api/jobs/:jobId/generate-embeddings/
 * Generates JD embedding and candidate embeddings for a session.
 */
export const generateEmbeddings = (jobId, sessionId) =>
  api.post(`/jobs/${jobId}/generate-embeddings/`, { session_id: sessionId });

/**
 * GET /api/jobs/:jobId/staged-resumes/?session_id=...
 */
export const getStagedResumes = (jobId, sessionId) =>
  api.get(`/jobs/${jobId}/staged-resumes/`, { params: { session_id: sessionId } });

/**
 * POST /api/jobs/:jobId/shortlist/
 * Ranks candidates and promotes top N candidates.
 */
export const shortlistCandidates = (jobId, data) =>
  api.post(`/jobs/${jobId}/shortlist/`, data);

/**
 * POST /api/jobs/:jobId/send-shortlist-emails/
 * Sends shortlist notification emails to selected candidates.
 */
export const sendShortlistEmails = (jobId, applicationIds, customMessage = '') =>
  api.post(`/jobs/${jobId}/send-shortlist-emails/`, {
    application_ids: applicationIds,
    custom_message: customMessage,
  });

/**
 * POST /api/jobs/:jobId/applications/:appId/generate-interview-kit/
 * Generates 10 personalized interview questions & model answers using Gemini.
 */
export const generateInterviewKit = (jobId, appId, difficulty = 'Mid-Level') =>
  api.post(`/jobs/${jobId}/applications/${appId}/generate-interview-kit/`, { difficulty });

/**
 * GET /api/jobs/:jobId/applications/:appId/interview-kit/
 * Retrieves existing interview kit for a candidate application.
 */
export const getInterviewKit = (jobId, appId) =>
  api.get(`/jobs/${jobId}/applications/${appId}/interview-kit/`);



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

