import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export async function loginRequest({ email, password }) {
  // Note: your backend expects username or email depending on setup.
  // If TokenObtainPairView expects username, send username field. Adjust if needed.
  return client.post("/login/", { username: email, password });
}

export async function registerRequest(payload) {
  return client.post("/register/", payload);
}

export async function refreshRequest(refresh) {
  return client.post("/token/refresh/", { refresh });
}
