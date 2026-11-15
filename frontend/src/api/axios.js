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

// Response interceptor to handle pagination seamlessly and handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    // Transparently handle DRF paginated responses:
    // If the backend returns { count, results: [...] }, augment the results array
    // with pagination metadata so existing code expecting an array (res.data.map, res.data.length)
    // continues working with zero breaking changes, while code accessing res.data.results or res.data.count
    // also works seamlessly.
    if (
      response?.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data) &&
      Array.isArray(response.data.results)
    ) {
      const paginatedArray = response.data.results;
      paginatedArray.count = response.data.count;
      paginatedArray.total_pages = response.data.total_pages;
      paginatedArray.current_page = response.data.current_page;
      paginatedArray.next = response.data.next;
      paginatedArray.previous = response.data.previous;
      paginatedArray.results = response.data.results;
      paginatedArray.pagination = {
        count: response.data.count,
        total_pages: response.data.total_pages,
        current_page: response.data.current_page,
        next: response.data.next,
        previous: response.data.previous,
      };
      response.data = paginatedArray;
    }
    return response;
  },
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