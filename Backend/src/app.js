import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import emailRouter from "./routes/email.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";

const app = express();

// Configure CORS to accept localhost on any port (5173, 5174, etc.)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      // or any localhost / 127.0.0.1 port (such as 5173, 5174, etc.)
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/email", emailRouter);
app.use("/api/chats", chatRouter);

app.get("/", (req, res) => {
  res.send("Hello from Nexora server");
});

export default app;
