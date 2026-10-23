import { sendEmail } from "./mail.service.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import "../config/env.js";
import { buildDemoEmailPayload } from "./terminalTest.service.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripMarkdownFormatting = (value = "") =>
  String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

const formatBodyHtml = (value = "") => {
  const normalizedValue = stripMarkdownFormatting(value);

  return escapeHtml(normalizedValue)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .trim();
};

export const extractJsonPayload = (rawContent) => {
  const text = String(rawContent || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  const jsonCandidate = firstBrace !== -1 && lastBrace !== -1 ? candidate.slice(firstBrace, lastBrace + 1) : candidate;

  return jsonCandidate;
};

export const normalizeEmailPayload = (payload = {}, { recipientName, senderName } = {}) => {
  const normalizedPayload = {
    subject: stripMarkdownFormatting(payload.subject || "").trim() || "A thoughtful update from Nexora",
    greeting: stripMarkdownFormatting(payload.greeting || "").trim() || `Hello${recipientName ? ` ${recipientName}` : ""},`,
    body: stripMarkdownFormatting(payload.body || "").trim() || "We hope this message finds you well.",
    footerNote: stripMarkdownFormatting(payload.footerNote || "").trim() || "Thank you for taking the time to read this message.",
  };

  if (normalizedPayload.footerNote && senderName && !normalizedPayload.footerNote.toLowerCase().includes(senderName.toLowerCase())) {
    normalizedPayload.footerNote = `${normalizedPayload.footerNote}\n${senderName}`;
  }

  return normalizedPayload;
};

const buildEmailTemplate = ({ title, greeting, body, footerNote }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; margin:0; padding:24px; color:#0f172a;">
    <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; padding:36px; box-shadow:0 16px 40px rgba(15,23,42,0.10);">
      <div style="font-size:13px; letter-spacing:0.16em; text-transform:uppercase; color:#6366f1; font-weight:700; margin-bottom:10px;">Nexora</div>
      <h1 style="margin:0 0 14px; font-size:28px; line-height:1.2; color:#111827;">${title}</h1>
      <p style="margin:0 0 14px; font-size:16px; line-height:1.7; color:#111827;">${greeting}</p>
      <div style="margin:0 0 18px; font-size:16px; line-height:1.8; color:#334155;">${body}</div>
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:14px; line-height:1.7; color:#64748b;">${footerNote}</div>
      <p style="margin-top:24px; font-size:14px; color:#64748b;">Best regards,<br /><strong style="color:#111827;">Nexora Team</strong></p>
    </div>
  </body>
</html>
`;

export const sendAIGeneratedEmail = async ({
  to,
  prompt,
  recipientName,
  tone = "professional",
  senderName = "Nexora Team",
}) => {
  const aiPrompt = `
You are an elite email copywriter and communications strategist.
Write a high-quality email that sounds natural, persuasive, and polished.

Requirements:
- Return valid JSON only with exactly these keys: subject, greeting, body, footerNote
- Keep the tone: ${tone}
- Make the content feel human, modern, and professional
- Keep it concise but meaningful, ideally 120 to 220 words total
- Use a warm and clear greeting, avoid generic filler, and make the message feel intentional
- The body must be suitable for HTML email and should read well as a paragraph-based message
- If recipientName is provided, personalize the greeting using it
- Avoid clichés, robotic phrasing, and overly salesy language
- Do not include markdown, bullets, or extra commentary

Request:
${prompt}

Recipient Name: ${recipientName || ""}
Sender Name: ${senderName}
`;

  const response = await model.invoke(aiPrompt);
  const content = response.content?.toString?.() || "";
  const jsonText = extractJsonPayload(content);

  let payload;
  try {
    payload = JSON.parse(jsonText);
  } catch (error) {
    payload = {
      subject: "A thoughtful update from Nexora",
      greeting: `Hello${recipientName ? ` ${recipientName}` : ""},`,
      body: content.replace(/\n+/g, " ").trim(),
      footerNote: "Thank you for taking the time to read this message.",
    };
  }

  const normalizedPayload = normalizeEmailPayload(payload, {
    recipientName,
    senderName,
  });

  const html = buildEmailTemplate({
    title: normalizedPayload.subject,
    greeting: normalizedPayload.greeting || `Hello${recipientName ? ` ${recipientName}` : ""},`,
    body: formatBodyHtml(normalizedPayload.body || ""),
    footerNote: formatBodyHtml(normalizedPayload.footerNote || "Thanks for reading this message."),
  });

  return sendEmail(to, normalizedPayload.subject, html);
};

export const runSimpleTerminalEmail = async ({ to, prompt, recipientName }) => {
  const payload = buildDemoEmailPayload({ to, prompt, recipientName });

  console.log("\nEmail payload:");
  console.log(JSON.stringify(payload, null, 2));

  if (!process.env.RESEND_API_KEY) {
    const simulatedResult = {
      success: true,
      mode: "simulated",
      message: "Email payload prepared for testing.",
      payload,
    };

    console.log("\nEmail result (simulated):");
    console.log(simulatedResult);
    return simulatedResult;
  }

  try {
    const result = await sendEmail(payload.to, payload.subject, payload.html);

    console.log("\nEmail result:");
    console.log(result);

    return result;
  } catch (error) {
    const simulatedResult = {
      success: true,
      mode: "simulated",
      message: "Email sending was blocked by provider validation, but the payload is ready for testing.",
      payload,
      error: error.message,
    };

    console.log("\nEmail result (simulated):");
    console.log(simulatedResult);
    return simulatedResult;
  }
};
