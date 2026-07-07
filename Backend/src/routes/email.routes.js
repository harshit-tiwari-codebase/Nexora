import { Router } from "express";
import { sendCustomEmail } from "../controllers/email.controller.js";

const emailRouter = Router();

emailRouter.post("/send", sendCustomEmail);

export default emailRouter;
