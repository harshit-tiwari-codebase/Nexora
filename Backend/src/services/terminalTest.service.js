export const buildDemoEmailPayload = ({ to, prompt, recipientName }) => {
  const safePrompt = String(prompt || "").trim() || "test";
  const safeRecipientName = String(recipientName || "").trim();
  const subject = `Test email: ${safePrompt.slice(0, 40)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Test email from Nexora</h2>
      <p>Hello${safeRecipientName ? ` ${safeRecipientName}` : ""},</p>
      <p>${safePrompt.replace(/\n/g, "<br />")}</p>
      <p>This is a simple terminal test email.</p>
    </div>
  `;

  return { to, subject, html };
};
