const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5003/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
};
