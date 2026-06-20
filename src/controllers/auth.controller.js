import UserModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send email verification link
 * @access  Public
 * @body {username , email , password}
 */
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const verificationLink = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Welcome to Nexora 🚀",
      `
    <h1>Welcome to Nexora 🚀</h1>
    <p>Hello ${username},</p>
    <p>Your account has been created successfully.</p>

    <p>Please verify your email address by clicking the button below:</p>

    <a
      href="${verificationLink}"
      style="
        display:inline-block;
        padding:12px 24px;
        background:#4F46E5;
        color:white;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
      "
    >
      Verify Email
    </a>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>

    <p>${verificationLink}</p>

    <br/>
    <p>Best Regards,</p>
    <p><strong>Nexora Team</strong></p>
  `,
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

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and generate access token
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email using verification token
 * @access  Public
 * @query   token
 */
export const verifyEmail = async (req, res, next) => {
  try {
    console.log("QUERY:", req.query);

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded);

    const user = await UserModel.findById(decoded.userId);
    console.log("USER:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Nexora - Email Verified</title>
    <style>
        body{
            font-family: Arial, sans-serif;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            background:#0f172a;
            color:white;
        }

        .card{
            text-align:center;
            background:#1e293b;
            padding:40px;
            border-radius:12px;
            box-shadow:0 0 20px rgba(0,0,0,0.3);
        }

        h1{
            color:#22c55e;
        }

        a{
            display:inline-block;
            margin-top:20px;
            padding:12px 20px;
            background:#6366f1;
            color:white;
            text-decoration:none;
            border-radius:8px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>✅ Email Verified Successfully</h1>
        <p>Your Nexora account has been verified.</p>
        <a href="http://localhost:3000">Go to Nexora</a>
    </div>
</body>
</html>
`);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
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