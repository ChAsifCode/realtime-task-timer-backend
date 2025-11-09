import express from "express";
import { User } from "../models/index.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validateUserInputs from "../middlewares/validateUserInputs.js";
import { createTaskSchema, updateTaskSchema, memberSchema } from "../controllers/task/joi.schema.js";
import { addMember, createTask, getTask, getTotal, myTasks, removeMember, removeTask, updateTask } from "../controllers/task/index.js";

const router = express.Router();

router.use(authMiddleware(User));

router.post("/", validateUserInputs(createTaskSchema, "body"), createTask);
router.get("/", myTasks);
router.get("/:id", getTask);
router.get("/:id/total", getTotal);
router.patch("/:id", validateUserInputs(updateTaskSchema, "body"), updateTask);
router.delete("/:id", removeTask);
router.post("/:id/members", validateUserInputs(memberSchema, "body"), addMember);
router.delete("/:id/members", validateUserInputs(memberSchema, "body"), removeMember);

export default router;
