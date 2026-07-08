import { Resend } from "resend";
import "../config/env.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const getFromAddress = () => {
  if (process.env.RESEND_FROM) {
    return process.env.RESEND_FROM;
  }

  const fromName = process.env.RESEND_FROM_NAME || "Nexora";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  return `${fromName} <${fromEmail}>`;
};

export const sendEmail = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  console.log("✅ Email sent");
  console.log(data);

  return data;
};