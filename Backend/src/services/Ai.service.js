import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import "../config/env.js";

const SYSTEM_PROMPT = `You are Nexora, a helpful, intelligent, and friendly AI coding and conversational assistant.
Provide clear, accurate, and concise answers. When writing code, provide clean, well-explained code snippets with markdown formatting.`;
const MAX_HISTORY = 15;
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const GROQ_MODEL = "llama-3.3-70b-versatile";

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
  const retryAfterSeconds =
    Number(providerError?.retryAfter) ||
    getRetryAfterSeconds(details);
  const error = new Error(
    isQuotaError
      ? "The AI provider's request quota has been reached. Please try again after the quota resets or increase the provider quota."
      : status === 429
        ? "The AI provider is rate-limiting requests. Please try again shortly."
        : "The AI provider is temporarily unavailable. Please try again."
  );

  error.statusCode = status === 429 ? 429 : 502;
  error.providerStatus = status || undefined;
  error.code = isQuotaError ? "AI_QUOTA_EXCEEDED" : "AI_PROVIDER_UNAVAILABLE";
  error.retryAfterSeconds = retryAfterSeconds;
  error.expose = true;

  return error;
};

const makeMessages = (history) => [
  new SystemMessage(SYSTEM_PROMPT),
  ...history.slice(-MAX_HISTORY).flatMap((message) => {
    if (message.role === "user") return [new HumanMessage(message.content)];
    if (message.role === "ai") return [new AIMessage(message.content)];
    return [];
  }),
];

const callGemini = async (modelName, messages) => {
  const model = new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: process.env.GEMINI_API_KEY,
    maxRetries: 0,
  });
  const response = await model.invoke(messages);
  const text = response.content?.toString() || "";

  if (!text) {
    throw Object.assign(new Error("Empty Gemini response"), { status: 502 });
  }

  return text;
};

const callGroq = async (messages) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: messages.map((message) => ({
        role:
          message instanceof SystemMessage
            ? "system"
            : message instanceof HumanMessage
              ? "user"
              : "assistant",
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = new Error(`Groq request failed with status ${response.status}`);
    error.status = response.status;
    error.retryAfter = Number(response.headers.get("retry-after")) || undefined;
    throw error;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw Object.assign(new Error("Empty Groq response"), { status: 502 });
  }

  return text;
};

const shouldFallback = (error) =>
  ![400, 422].includes(Number(error?.providerStatus || error?.status));

const generateWithFallback = async (messages) => {
  const providers = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push(
      ...GEMINI_MODELS.map((modelName) => ({
        name: `Gemini/${modelName}`,
        call: () => callGemini(modelName, messages),
      }))
    );
  }

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: `Groq/${GROQ_MODEL}`,
      call: () => callGroq(messages),
    });
  }

  if (!providers.length) {
    const error = new Error(
      "No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY on the backend."
    );
    error.statusCode = 503;
    error.code = "AI_PROVIDER_NOT_CONFIGURED";
    error.expose = true;
    throw error;
  }

  let lastError;
  let retryAfterSeconds;

  for (const provider of providers) {
    try {
      return await provider.call();
    } catch (providerError) {
      const error = toAiProviderError(providerError);
      console.warn(
        `[AI] ${provider.name} failed with status ${error.providerStatus || "unknown"}`
      );
      retryAfterSeconds ||= error.retryAfterSeconds;
      lastError = error;

      if (!shouldFallback(providerError)) {
        throw error;
      }
    }
  }

  if (retryAfterSeconds && lastError?.statusCode !== 429) {
    lastError.statusCode = 429;
    lastError.code = "AI_QUOTA_EXCEEDED";
    lastError.message =
      "All configured AI providers are currently unavailable or rate-limited. Please try again later.";
  }
  if (retryAfterSeconds) lastError.retryAfterSeconds = retryAfterSeconds;

  throw lastError;
};

/**
 * Generate an AI reply, falling back to another configured provider on failure.
 * @param {{ history?: Array<{ role: string, content: string }>, prompt: string }} options
 * @returns {Promise<string>}
 */
export const generateChatReply = async ({ history = [], prompt }) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  try {
    return await generateWithFallback([
      ...makeMessages(history),
      new HumanMessage(prompt),
    ]);
  } catch (error) {
    if (error.expose) throw error;

    const aiError = toAiProviderError(error);
    console.error("AI Generation Error:", {
      code: aiError.code,
      statusCode: aiError.statusCode,
      retryAfterSeconds: aiError.retryAfterSeconds,
    });
    throw aiError;
  }
};

/**
 * Generate a concise 3-5 word title for a new conversation.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export const generateChatTitle = async (prompt) => {
  try {
    const title = await generateWithFallback([
      new SystemMessage(
        "Generate a concise 3 to 5 word title for a conversation that starts with this message. Return ONLY the title text, with no quotes, no markdown, and no punctuation."
      ),
      new HumanMessage(prompt),
    ]);

    return title.trim().replace(/["'\n]/g, "").slice(0, 40) || "New Chat";
  } catch (error) {
    console.warn("Failed to generate title, using fallback:", error.message);
    return prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "");
  }
};

export const testAI = async () => {
  try {
    const response = await generateWithFallback([
      new HumanMessage("What is today's date?"),
    ]);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

export const runSimpleTerminalChat = async (prompt) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    const fallback = `Test mode response to: ${prompt}`;
    console.log("\nAI response:");
    console.log(fallback);
    return fallback;
  }

  const response = await generateWithFallback([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);
  console.log("\nAI response:");
  console.log(response);

  return response;
};
