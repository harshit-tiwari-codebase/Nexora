import { sendAIGeneratedEmail } from "../services/email.agent.service.js";

export const sendCustomEmail = async (req, res, next) => {
  try {
    const { to, prompt, recipientName, tone, senderName } = req.body;

    if (!to || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Recipient email and prompt are required",
      });
    }

    const result = await sendAIGeneratedEmail({
      to,
      prompt,
      recipientName,
      tone,
      senderName,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
