import UserModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import {sendEmail} from "../services/mail.service.js"



export const registerUser = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    const user = await UserModel.create({
      username,
      email,
      password,
    });

  await sendEmail(
  email,
  "Welcome to Nexora 🚀",
  `
    <h1>Welcome to Nexora 🚀</h1>
    <p>Hello ${username},</p>
    <p>Your account has been created successfully.</p>
    <p>We're excited to have you on board.</p>
    <p>Start exploring AI-powered conversations with Nexora.</p>
    <br/>
    <p>Best Regards,</p>
    <p><strong>Nexora Team</strong></p>
  `
);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
