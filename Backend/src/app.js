import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import emailRouter from "./routes/email.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";

const app = express();

// Trust the deployment proxy so secure cookies work behind Render / Railway.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
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