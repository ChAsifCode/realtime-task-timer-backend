import express from "express";
import welcome from "./welcome.js";
import userAuth from "./user.js";
import taskRouter from "./task.js";
import timerRouter from "./timer.js";


const router = express.Router();

router.use("/welcome", welcome);
router.use("/user", userAuth);
router.use("/task", taskRouter);
router.use("/timer", timerRouter);


export default router;