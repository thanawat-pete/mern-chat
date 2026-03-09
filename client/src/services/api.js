import axios from "axios";
// Fallback to ensure correct baseURL even if .env is not loaded
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;