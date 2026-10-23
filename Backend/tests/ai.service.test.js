import test from "node:test";
import assert from "node:assert/strict";
import {
  generateChatReply,
  getRetryAfterSeconds,
  toAiProviderError,
} from "../src/services/Ai.service.js";

test("extracts Gemini retry delay from quota error details", () => {
  assert.equal(
    getRetryAfterSeconds('{"retryDelay":"42104s"}'),
    42104
  );
  assert.equal(getRetryAfterSeconds("no retry metadata"), undefined);
});

test("maps exhausted Gemini quota to an actionable HTTP 429", () => {
  const error = toAiProviderError({
    status: 429,
    message:
      'Quota exceeded for generate_content_free_tier_requests {"retryDelay":"42104s"}',
  });

  assert.equal(error.statusCode, 429);
  assert.equal(error.code, "AI_QUOTA_EXCEEDED");
  assert.equal(error.retryAfterSeconds, 42104);
  assert.match(error.message, /quota.*reached/i);
  assert.equal(error.expose, true);
});

test("maps other provider failures without exposing provider internals", () => {
  const error = toAiProviderError({
    status: 500,
    message: "private provider diagnostic",
  });

  assert.equal(error.statusCode, 502);
  assert.equal(error.code, "AI_PROVIDER_UNAVAILABLE");
  assert.doesNotMatch(error.message, /private provider diagnostic/);
});

test("maps a Groq rate limit and preserves its retry-after header", () => {
  const error = toAiProviderError({
    status: 429,
    retryAfter: 30,
    message: "Groq rate limit exceeded",
  });

  assert.equal(error.statusCode, 429);
  assert.equal(error.code, "AI_QUOTA_EXCEEDED");
  assert.equal(error.retryAfterSeconds, 30);
});

test("generates a reply with Groq when Gemini is not configured", async () => {
  const previousGeminiKey = process.env.GEMINI_API_KEY;
  const previousGroqKey = process.env.GROQ_API_KEY;
  const previousGroqModel = process.env.GROQ_MODEL;
  const previousFetch = globalThis.fetch;

  process.env.GEMINI_API_KEY = "";
  process.env.GROQ_API_KEY = "test-groq-key";
  process.env.GROQ_MODEL = "openai/gpt-oss-120b";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(JSON.parse(options.body).model, "openai/gpt-oss-120b");
    assert.equal(options.headers.Authorization, "Bearer test-groq-key");

    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Groq test response" } }],
      }),
    };
  };

  try {
    assert.equal(
      await generateChatReply({ history: [], prompt: "Hello" }),
      "Groq test response"
    );
  } finally {
    if (previousGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGeminiKey;

    if (previousGroqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousGroqKey;

    if (previousGroqModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = previousGroqModel;

    globalThis.fetch = previousFetch;
  }
});
