import express from "express";
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRouter);


app.get("/", (req, res) => {
  res.send("hello from Nexora server");
});

export default app;