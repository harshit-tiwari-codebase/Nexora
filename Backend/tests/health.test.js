import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import app from "../src/app.js";

test("GET /api/health reports database readiness and process uptime", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  const body = await response.json();
  const databaseConnected = mongoose.connection.readyState === 1;

  assert.equal(response.status, databaseConnected ? 200 : 503);
  assert.equal(body.success, databaseConnected);
  assert.equal(body.status, databaseConnected ? "ok" : "degraded");
  assert.equal(body.database, databaseConnected ? "connected" : "disconnected");
  assert.equal(Number.isInteger(body.uptimeSeconds), true);
});
