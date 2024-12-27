import { Router } from "express";
import { login } from "../controllers/userController.js";
import { signUp } from "../controllers/userController.js";

const userRouter = Router();

userRouter.route("/login").post(login)

userRouter.route("/signup").post(signUp)

userRouter.route("/add_to_meetingList")

userRouter.route("/get_meetingList")

export {userRouter};