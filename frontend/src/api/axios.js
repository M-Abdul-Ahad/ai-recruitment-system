import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Request interceptor to automatically attach the access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 occurs on protected endpoints, not during login or signup requests
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/auth/login/") || requestUrl.includes("/auth/signup/");

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      console.warn("Unauthorized request on protected endpoint - logging out");
      // Clear token and user data
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      // Redirect to login page only if not already on login/signup
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;