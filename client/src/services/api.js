import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseURL = isLocal
  ? (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  : "https://salon-management-system-ijtv.onrender.com/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor - unwrap data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
