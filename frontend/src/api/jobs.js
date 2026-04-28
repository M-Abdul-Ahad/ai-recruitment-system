import api from './axios';

export const getJobs = () => api.get('/jobs/');

export const createJob = (data) => api.post('/jobs/', data);

export const updateJob = (id, data) => api.patch(`/jobs/${id}/`, data);

export const deleteJob = (id) => api.delete(`/jobs/${id}/`);

export const publishJob = (id) => api.post(`/jobs/${id}/publish/`);

export const closeJob = (id) => api.post(`/jobs/${id}/close/`);

export const getSkills = () => api.get('/jobs/skills/');

export const getApplicants = (jobId) => api.get(`/jobs/${jobId}/applications/`);

export const updateApplicantStatus = (jobId, appId, status) => 
  api.patch(`/jobs/${jobId}/applications/${appId}/`, { status });
