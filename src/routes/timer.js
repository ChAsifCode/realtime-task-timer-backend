import express from "express";
import { User } from "../models/index.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateUserInputs.js";
import { paramTaskIdSchema } from "../controllers/timer/joi.schema.js";
import { activeSessions, forceStopAll, startTimer, stopTimer } from "../controllers/timer/index.js";

const r = express.Router();

r.use(authMiddleware(User));

r.post("/:taskId/start", validate(paramTaskIdSchema, "params"), startTimer);
r.post("/:taskId/stop", validate(paramTaskIdSchema, "params"), stopTimer);
r.get("/:taskId/active", validate(paramTaskIdSchema, "params"), activeSessions);
r.post("/:taskId/force-stop-all", validate(paramTaskIdSchema, "params"), forceStopAll);

export default r;
