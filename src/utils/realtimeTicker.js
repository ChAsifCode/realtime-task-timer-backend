import { Task, TimerSession } from "../models/index.js";
import { rooms } from "../../socket.js";

const activeTickers = new Map();

export const ensureTicker = async (io, taskId) => {
    if (activeTickers.has(taskId)) return;

    const activeCount = await TimerSession.countDocuments({ task: taskId, stoppedAt: null });
    if (!activeCount) return;

    const intervalId = setInterval(async () => {
        const task = await Task.findById(taskId).lean();
        if (!task) {
            clearInterval(intervalId);
            activeTickers.delete(taskId);
            return;
        }
        const actives = await TimerSession.find({ task: taskId, stoppedAt: null }).select("startedAt").lean();
        if (actives.length === 0) {
            clearInterval(intervalId);
            activeTickers.delete(taskId);
            io.to(rooms.taskRoom(taskId)).emit("timer:tick", {
                taskId, totalElapsedMs: task.totalElapsedMs, activeCount: 0
            });
            return;
        }
        const now = Date.now();
        const activeSum = actives.reduce((acc, s) => acc + (now - new Date(s.startedAt).getTime()), 0);
        io.to(rooms.taskRoom(taskId)).emit("timer:tick", {
            taskId,
            totalElapsedMs: task.totalElapsedMs + activeSum,
            activeCount: actives.length
        });
    }, 1000);
    activeTickers.set(taskId, intervalId);
};
