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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Nexora • Email Verified</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:Inter,system-ui,sans-serif;
    background:#09090B;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:100vh;
    overflow:hidden;
}

.background{
    position:absolute;
    inset:0;
    background:
    radial-gradient(circle at top left,#7c3aed25,transparent 35%),
    radial-gradient(circle at bottom right,#06b6d425,transparent 35%);
}

.card{
    position:relative;
    width:420px;
    padding:48px;
    border:1px solid #27272a;
    border-radius:28px;
    background:rgba(24,24,27,.75);
    backdrop-filter:blur(18px);
    text-align:center;
    z-index:2;
}

.logo{
    width:72px;
    height:72px;
    margin:auto;
    border-radius:22px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    font-weight:700;
    background:linear-gradient(135deg,#8b5cf6,#06b6d4);
    margin-bottom:28px;
}

.success{
    width:72px;
    height:72px;
    margin:auto;
    border-radius:50%;
    background:#16a34a20;
    display:flex;
    justify-content:center;
    align-items:center;
    color:#22c55e;
    font-size:34px;
    margin-bottom:28px;
}

h1{
    font-size:34px;
    margin-bottom:14px;
}

p{
    color:#a1a1aa;
    line-height:1.7;
    font-size:15px;
}

.btn{
    display:inline-flex;
    justify-content:center;
    align-items:center;
    margin-top:34px;
    padding:15px 30px;
    text-decoration:none;
    color:black;
    font-weight:600;
    border-radius:999px;
    background:white;
    transition:.25s;
}

.btn:hover{
    transform:translateY(-2px);
}

.timer{
    margin-top:22px;
    color:#71717a;
    font-size:14px;
}
</style>

<script>
let seconds = 5;

function countdown(){

    document.getElementById("count").innerText = seconds;

    if(seconds===0){
        window.location.href="http://localhost:5173/login";
    }

    seconds--;

}

setInterval(countdown,1000);
</script>

</head>

<body>

<div class="background"></div>

<div class="card">

<div class="logo">
N
</div>

<div class="success">
✓
</div>

<h1>Email Verified</h1>

<p>
Your Nexora account has been successfully verified.
You can now sign in and start using your AI workspace.
</p>

<a
class="btn"
href="http://localhost:5173/login"
>
Go to Login
</a>

<div class="timer">
Redirecting in
<span id="count">5</span>
seconds...
</div>

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
