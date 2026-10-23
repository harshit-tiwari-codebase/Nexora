import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function register({ email, username, password }) {
  const response = await API.post("/api/auth/register", {
    email,
    username,
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await API.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function getMe() {
  const response = await API.get("/api/auth/get-me");

  return response.data;
}

export async function logout() {
  const response = await API.post("/api/auth/logout");

  return response.data;
}
