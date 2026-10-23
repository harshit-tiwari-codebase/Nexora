import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Fetch all chat conversations for current user
 */
export async function getChats() {
  const response = await API.get("/api/chats");
  return response.data.chats;
}

/**
 * Create a new chat conversation
 */
export async function createNewChat(title = "New Chat") {
  const response = await API.post("/api/chats", { title });
  return response.data.chat;
}

/**
 * Fetch a single chat conversation and its message history
 */
export async function getChatDetails(chatId) {
  const response = await API.get(`/api/chats/${chatId}`);
  return response.data;
}

/**
 * Send a message to the AI in a specific chat
 */
export async function sendChatMessage(chatId, content) {
  const response = await API.post(`/api/chats/${chatId}/messages`, { content });
  return response.data;
}

/**
 * Delete a chat conversation
 */
export async function deleteChatById(chatId) {
  const response = await API.delete(`/api/chats/${chatId}`);
  return response.data;
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId, title) {
  const response = await API.put(`/api/chats/${chatId}`, { title });
  return response.data.chat;
}
