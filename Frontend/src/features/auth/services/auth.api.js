import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
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