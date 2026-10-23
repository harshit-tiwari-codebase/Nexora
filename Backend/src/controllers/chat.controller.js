import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { generateChatReply } from "../services/Ai.service.js";

/**
 * @desc    Create a new chat conversation
 * @route   POST /api/chats
 * @access  Private
 */
export const createChat = async (req, res, next) => {
  try {
    const { title } = req.body;

    const chat = await ChatModel.create({
      user: req.userId,
      title: title?.trim() || "New Chat",
    });

    return res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all chat conversations for logged-in user
 * @route   GET /api/chats
 * @access  Private
 */
export const getAllChats = async (req, res, next) => {
  try {
    const chats = await ChatModel.find({ user: req.userId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single chat details and its messages
 * @route   GET /api/chats/:id
 * @access  Private
 */
export const getChatById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await ChatModel.findOne({ _id: id, user: req.userId }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Get all messages for this chat in chronological order
    const messages = await MessageModel.find({ chat: chat._id })
      .select("chat content role createdAt updatedAt")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      chat,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a chat and get AI response
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Ensure the chat exists and belongs to this user
    const chat = await ChatModel.findOne({ _id: id, user: req.userId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Load only the recent context the model consumes, without hydrating Mongoose documents.
    const previousMessages = await MessageModel.find({ chat: chat._id })
      .sort({ createdAt: -1 })
      .limit(15)
      .select("role content -_id")
      .lean();
    previousMessages.reverse();

    // Save the user's message before requesting the model so it is retained on provider errors.
    const userMessage = await MessageModel.create({
      chat: chat._id,
      content: content.trim(),
      role: "user",
    });

    // Generate the reply using the bounded recent history.
    const aiContent = await generateChatReply({
      history: previousMessages,
      prompt: content.trim(),
    });

    const aiMessage = await MessageModel.create({
      chat: chat._id,
      content: aiContent,
      role: "ai",
    });

    // Avoid a second Gemini request; derive a useful title from the first prompt.
    if (chat.title === "New Chat" || previousMessages.length === 0) {
      const title = content.trim().replace(/\s+/g, " ");
      chat.title = title.length > 40 ? `${title.slice(0, 37).trimEnd()}...` : title;
    }

    // Update the timestamp on the chat
    chat.updatedAt = new Date();
    await chat.save();

    return res.status(200).json({
      success: true,
      userMessage,
      aiMessage,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a chat title
 * @route   PATCH /api/chats/:id
 * @access  Private
 */
export const updateChatTitle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const chat = await ChatModel.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a chat and all its messages
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
export const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await ChatModel.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Delete all messages belonging to this chat
    await MessageModel.deleteMany({ chat: id });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
