import api from './axios';

// ─── Admin — User Management ───────────────────────────────────────────────

/** GET /api/auth/admin/users/ — list all users */
export const getUsers = () => api.get('/auth/admin/users/');

/** POST /api/auth/admin/users/ — create a new user */
export const createUser = (data) => api.post('/auth/admin/users/', data);

/** PATCH /api/auth/admin/users/:id/ — update a user */
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
