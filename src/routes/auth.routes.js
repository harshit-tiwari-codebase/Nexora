import {Router} from "express"
import { registerUser , verifyEmail ,loginUser, getMe} from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";


const authRouter = Router();

authRouter.post("/register",registerValidator,registerUser);
authRouter.post("/login",loginValidator,loginUser)
authRouter.get("/verify-email" , verifyEmail );
authRouter.get("/get-me" , authenticateUser, getMe)

export default authRouter;
