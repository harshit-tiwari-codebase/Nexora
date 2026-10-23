import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import "../config/env.js";

// Initialize Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

// System prompt that defines Nexora's personality
const SYSTEM_PROMPT = `You are Nexora, a helpful, intelligent, and friendly AI coding and conversational assistant.
Provide clear, accurate, and concise answers. When writing code, provide clean, well-explained code snippets with markdown formatting.`;

/**
 * Generate AI reply using Gemini with chat history context
 * @param {Array} history - Previous messages in format [{ role: 'user'|'ai', content: string }]
 * @param {string} prompt - Current message from user
 * @returns {Promise<string>} - AI response text
 */
export const generateChatReply = async ({ history = [], prompt }) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  try {
    const formattedMessages = [new SystemMessage(SYSTEM_PROMPT)];

    // Add previous messages (limiting to last 15 messages for optimal speed and context)
    const recentHistory = history.slice(-15);
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        formattedMessages.push(new HumanMessage(msg.content));
      } else if (msg.role === "ai") {
        formattedMessages.push(new AIMessage(msg.content));
      }
    }

    // Add current user prompt
    formattedMessages.push(new HumanMessage(prompt));

    const response = await model.invoke(formattedMessages);
    return response.content?.toString() || "";
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    throw new Error("Failed to generate AI response. Please try again.");
  }
};

/**
 * Generate a concise 3-5 word title for a new conversation
 * @param {string} prompt - First message from the user
 * @returns {Promise<string>} - Generated title
 */
export const generateChatTitle = async (prompt) => {
  try {
    const response = await model.invoke([
      new SystemMessage(
        "Generate a concise 3 to 5 word title for a conversation that starts with this message. Return ONLY the title text, with no quotes, no markdown, and no punctuation."
      ),
      new HumanMessage(prompt),
    ]);

    const title = response.content?.toString().trim();
    return title ? title.replace(/["'\n]/g, "").slice(0, 40) : "New Chat";
  } catch (error) {
    console.warn("Failed to generate title, using fallback:", error.message);
    return prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "");
  }
};

export const testAI = async () => {
  try {
    const response = await model.invoke("todays date ?but today is 27 june 2026");
    console.log(response.content);
  } catch (error) {
    console.error(error);
  }
};

export const runSimpleTerminalChat = async (prompt) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (!process.env.GEMINI_API_KEY) {
    const fallback = `Test mode response to: ${prompt}`;
    console.log("\nAI response:");
    console.log(fallback);
    return fallback;
  }

  try {
    const response = await model.invoke(prompt);
    const content = response.content?.toString?.() || "";

    console.log("\nAI response:");
    console.log(content);

    return content;
  } catch (error) {
    const fallback = `Test mode fallback after error: ${error.message}`;
    console.log("\nAI response:");
    console.log(fallback);
    return fallback;
  }
};
