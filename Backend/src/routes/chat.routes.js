import { Router } from "express";
import {
  createChat,
  getAllChats,
  getChatById,
  sendMessage,
  updateChatTitle,
  deleteChat,
} from "../controllers/chat.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

// Protect all chat routes with authentication middleware
chatRouter.use(authenticateUser);

// Chat collection routes
chatRouter.post("/", createChat);
chatRouter.get("/", getAllChats);

// Single chat routes
chatRouter.get("/:id", getChatById);
chatRouter.patch("/:id", updateChatTitle);
chatRouter.delete("/:id", deleteChat);

// Chat messaging
chatRouter.post("/:id/messages", sendMessage);

export default chatRouter;
