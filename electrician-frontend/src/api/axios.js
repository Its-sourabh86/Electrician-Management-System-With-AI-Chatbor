import axios from "axios";

// Using direct backend URL
// Ensure your Backend has @CrossOrigin(origins = "http://localhost:5173")
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include Basic Auth credentials
api.interceptors.request.use(
  (config) => {
    // DO NOT add Authorization header for login/register endpoints
    if (config.url.startsWith('/auth/')) {
      return config;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.authHeader) {
      config.headers.Authorization = `Basic ${user.authHeader}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
