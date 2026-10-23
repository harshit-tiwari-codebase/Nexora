import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { isAllowedOrigin } from "../src/config/cors.js";

test("CORS allows the Nexora Vercel deployment and its previews", () => {
  assert.equal(
    isAllowedOrigin("https://nexora-mp0ezfe41-coding-avenger.vercel.app"),
    true
  );
  assert.equal(isAllowedOrigin("https://nexora-coding-avenger.vercel.app"), true);
  assert.equal(isAllowedOrigin("https://other-project-coding-avenger.vercel.app"), false);
  assert.equal(isAllowedOrigin("https://nexora.vercel.app.evil.example"), false);
});

test("CORS allows configured origins and local development only", () => {
  const originalClientUrl = process.env.CLIENT_URL;
  process.env.CLIENT_URL = "https://nexora.example.com, https://admin.example.com/";

  try {
    assert.equal(isAllowedOrigin("https://nexora.example.com"), true);
    assert.equal(isAllowedOrigin("https://admin.example.com"), true);
    assert.equal(isAllowedOrigin("http://localhost:5173"), true);
    assert.equal(isAllowedOrigin("https://attacker.example"), false);
  } finally {
    if (originalClientUrl === undefined) {
      delete process.env.CLIENT_URL;
    } else {
      process.env.CLIENT_URL = originalClientUrl;
    }
  }
});

test("CORS preflight allows the Nexora Vercel deployment with credentials", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const origin = "https://nexora-mp0ezfe41-coding-avenger.vercel.app";
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  assert.match(response.headers.get("access-control-allow-methods"), /POST/);
});

test("CORS rejects an unconfigured origin with a JSON 403", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`, {
    headers: { Origin: "https://attacker.example" },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Origin not allowed",
  });
});
