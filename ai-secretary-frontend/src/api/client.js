const API_BASE = "https://magnificent-mercy-ritwikkarthikeya-a5e5a947.koyeb.app/api";
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  return res.json();
};
