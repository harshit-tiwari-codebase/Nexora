import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import emailRouter from "./routes/email.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import mongoose from "mongoose";
import { isAllowedOrigin } from "./config/cors.js";

const app = express();

// Trust the deployment proxy so secure cookies work behind Render / Railway.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    status: databaseConnected ? "ok" : "degraded",
    database: databaseConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/email", emailRouter);
app.use("/api/chats", chatRouter);

app.get("/", (req, res) => {
  res.send("Hello from Nexora server");
});

app.use((error, req, res, next) => {
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : 500;

  if (statusCode >= 500) {
    console.error("Request failed:", error);
  }

  if (error.retryAfterSeconds) {
    res.set("Retry-After", String(error.retryAfterSeconds));
  }

  return res.status(statusCode).json({
    success: false,
    message:
      error.expose === true
        ? error.message
        : statusCode === 500
          ? "An unexpected server error occurred."
          : error.message,
    ...(error.code && { code: error.code }),
    ...(error.retryAfterSeconds && {
      retryAfterSeconds: error.retryAfterSeconds,
    }),
  });
});

export default app;