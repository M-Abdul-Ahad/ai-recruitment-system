import api from "./axios";

export const getMyCompany = () => api.get("/companies/me/");

export const getCompanyMembers = () => api.get("/companies/members/");

export const createCompany = (data) => api.post("/companies/register/", data);
