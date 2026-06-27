import { Resend } from "resend";
import "../config/env.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({
    from: "Nexora <onboarding@resend.dev>",
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