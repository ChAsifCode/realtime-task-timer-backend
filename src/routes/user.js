import express from "express";
import { User } from "../models/index.js";
import {
    signup,
    verifyEmail,
    loginUser,
} from "../controllers/user/index.js";
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
} from "../controllers/user/joi.schema.js";
import validateUserInputs from "../middlewares/validateUserInputs.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", validateUserInputs(signupSchema, 'body'), signup);
router.post("/login", validateUserInputs(loginSchema, 'body'), loginUser);
router.post("/verify-email", authMiddleware(User), validateUserInputs(verifyEmailSchema, 'body'), verifyEmail);

export default router;
