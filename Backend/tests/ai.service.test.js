import test from "node:test";
import assert from "node:assert/strict";
import {
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
