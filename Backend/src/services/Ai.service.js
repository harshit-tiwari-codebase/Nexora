import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import "../config/env.js";

// Initialize Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  maxRetries: 0,
});

// System prompt that defines Nexora's personality
const SYSTEM_PROMPT = `You are Nexora, a helpful, intelligent, and friendly AI coding and conversational assistant.
Provide clear, accurate, and concise answers. When writing code, provide clean, well-explained code snippets with markdown formatting.`;

export const getRetryAfterSeconds = (message = "") => {
  const match = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
  return match ? Math.ceil(Number(match[1])) : undefined;
};

export const toAiProviderError = (providerError) => {
  const details = String(providerError?.message || "");
  const status =
    Number(providerError?.status || providerError?.statusCode) ||
    Number(details.match(/\[(\d{3})\s/)?.[1]);
  const isQuotaError =
    status === 429 && /quota|resource_exhausted|rate limit/i.test(details);
  const retryAfterSeconds = getRetryAfterSeconds(details);
  const error = new Error(
    isQuotaError
      ? "The AI provider's request quota has been reached. Please try again after the quota resets or increase the provider quota."
      : status === 429
        ? "The AI provider is rate-limiting requests. Please try again shortly."
        : "The AI provider is temporarily unavailable. Please try again."
  );

  error.statusCode = status === 429 ? 429 : 502;
  error.code = isQuotaError ? "AI_QUOTA_EXCEEDED" : "AI_PROVIDER_UNAVAILABLE";
  error.retryAfterSeconds = retryAfterSeconds;
  error.expose = true;

  return error;
};

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
    const aiError = toAiProviderError(error);
    console.error("AI Generation Error:", {
      code: aiError.code,
      statusCode: aiError.statusCode,
      retryAfterSeconds: aiError.retryAfterSeconds,
      message: error.message,
    });
    throw aiError;
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
