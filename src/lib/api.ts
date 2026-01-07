const rawApiUrl = import.meta.env.VITE_API_URL;
const fallbackApiUrl = "http://localhost:3001";
const baseApiUrl = rawApiUrl ?? fallbackApiUrl;

export const API_URL = baseApiUrl.trim().replace(/\/+$/, "");
