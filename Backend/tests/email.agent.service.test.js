import test from "node:test";
import assert from "node:assert/strict";
import { extractJsonPayload, normalizeEmailPayload } from "../src/services/email.agent.service.js";

test("extractJsonPayload extracts JSON from fenced markdown content", () => {
  const source = "```json\n{\n  \"subject\": \"Hello\",\n  \"greeting\": \"Hi Vision,\",\n  \"body\": \"This is the body\",\n  \"footerNote\": \"Thanks for reading\"\n}\n```";

  assert.equal(extractJsonPayload(source), '{\n  "subject": "Hello",\n  "greeting": "Hi Vision,",\n  "body": "This is the body",\n  "footerNote": "Thanks for reading"\n}');
});

test("normalizeEmailPayload sanitizes and defaults values", () => {
  const payload = normalizeEmailPayload(
    {
      subject: " **Your roadmap** ",
      greeting: "Hi Vision,",
      body: "First line\n\nSecond line",
      footerNote: "Best regards,\n**Nexora Team**",
    },
    {
      recipientName: "Vision",
      senderName: "Nexora Team",
    }
  );

  assert.equal(payload.subject, "Your roadmap");
  assert.equal(payload.greeting, "Hi Vision,");
  assert.equal(payload.body, "First line\n\nSecond line");
  assert.equal(payload.footerNote, "Best regards,\nNexora Team");
});
