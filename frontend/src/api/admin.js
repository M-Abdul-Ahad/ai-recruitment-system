import api from './axios';

// ─── Admin — User Management ───────────────────────────────────────────────

/** GET /api/auth/admin/users/ — list all users */
export const getUsers = () => api.get('/auth/admin/users/');

/** POST /api/auth/admin/users/ — create a new user */
export const createUser = (data) => api.post('/auth/admin/users/', data);

/** PATCH /api/auth/admin/users/:id/ — update a user (partial) */
export const updateUser = (id, data) => api.patch(`/auth/admin/users/${id}/`, data);

/** DELETE /api/auth/admin/users/:id/ — delete a user */
export const deleteUser = (id) => api.delete(`/auth/admin/users/${id}/`);

// ─── Admin — Role Management ───────────────────────────────────────────────

/** GET /api/auth/admin/roles/ — list all roles */
export const getRoles = () => api.get('/auth/admin/roles/');

/** POST /api/auth/admin/roles/ — create a new role */
export const createRole = (data) => api.post('/auth/admin/roles/', data);

/** PATCH /api/auth/admin/roles/:id/ — update a role */
export const updateRole = (id, data) => api.patch(`/auth/admin/roles/${id}/`, data);

/** DELETE /api/auth/admin/roles/:id/ — delete a role */
export const deleteRole = (id) => api.delete(`/auth/admin/roles/${id}/`);

// ─── Admin — Company Management ───────────────────────────────────────────

/** GET /api/companies/admin/ — list all companies */
export const getCompanies = () => api.get('/companies/admin/');

/** POST /api/companies/admin/ — create a new company */
export const createCompany = (data) => api.post('/companies/admin/', data);

/** PATCH /api/companies/admin/:id/ — update a company */
export const updateCompany = (id, data) => api.patch(`/companies/admin/${id}/`, data);

/** DELETE /api/companies/admin/:id/ — delete a company */
export const deleteCompany = (id) => api.delete(`/companies/admin/${id}/`);

// ─── Admin — Job Management ───────────────────────────────────────────────

/** GET /api/jobs/admin/ — list all jobs */
export const getJobs = () => api.get('/jobs/admin/');

/** POST /api/jobs/admin/ — create a new job */
export const createJob = (data) => api.post('/jobs/admin/', data);

/** PATCH /api/jobs/admin/:id/ — update a job */
export const updateJob = (id, data) => api.patch(`/jobs/admin/${id}/`, data);

/** DELETE /api/jobs/admin/:id/ — delete a job */
export const deleteJob = (id) => api.delete(`/jobs/admin/${id}/`);

// ─── Admin — Skills (for job form dropdowns) ─────────────────────────────

/** GET /api/jobs/skills/ — list all skills */
export const getSkills = () => api.get('/jobs/skills/');
