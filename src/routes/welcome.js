import express from "express";
import Message from "../controllers/welcome/message.js";

const router = express.Router();

router.get("/message", Message);

export default router;
