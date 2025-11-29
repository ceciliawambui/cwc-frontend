import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("No token found:", err);
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const refresh = auth?.refresh;

      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/token/refresh/`, {
            refresh,
          });
          const updatedAuth = { ...auth, access: data.access };
          localStorage.setItem("auth", JSON.stringify(updatedAuth));
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return axios(error.config);
        } catch (refreshErr) {
          console.error("Token refresh failed:", refreshErr);
          localStorage.removeItem("auth");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function loginRequest({ email, password }) {
  return client.post(`${API_BASE}/login/`, { username: email, password });
}

export async function registerRequest(payload) {
  return client.post(`${API_BASE}/register/`, payload);
}

export default client;
