import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { TimerSession, Task } from "../../models/index.js";
import { ensureTicker } from "../../utils/realtimeTicker.js";

const assertMember = async (taskId, userId) => {
  const t = await Task.findOne({ _id: taskId, members: userId });
  return !!t;
};

export const startTimer = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const isMember = await assertMember(taskId, userId);
    if (!isMember) throw new ApiError("not_allowed", 404, "Task not found or not a member", true);

    try {
      const session = await TimerSession.create({
        task: taskId,
        user: userId,
        startedAt: new Date(),
        stoppedAt: null,
        elapsedMs: 0,
      });
      req.io?.to(`task:${taskId}`).emit("timer:started", { taskId, userId: String(userId), startedAt: session.startedAt });
      await ensureTicker(req.io, taskId);
      return sendSuccessResponse(res, 200, true, "Timer started", "timer", { started: true });
    } catch (e) {
      throw new ApiError("conflict", 409, "Timer already running for this user on this task", true);
    }
  } catch (e) { next(e); }
};

export const stopTimer = async (req, res, next) => {
  try {
    const { params: { taskId }, user: { _id } } = req;
    const isMember = await assertMember(taskId, _id);
    if (!isMember) throw new ApiError("not_allowed", 404, "Task not found or not a member", true);

    const session = await TimerSession.findOne({ task: taskId, user: _id, stoppedAt: null });
    if (!session) throw new ApiError("no_active_timer", 400, "No active timer", true);

    const now = new Date();
    const delta = now.getTime() - new Date(session.startedAt).getTime();
    session.stoppedAt = now;
    session.elapsedMs = delta;
    await session.save();

    await Task.updateOne({ _id: taskId }, { $inc: { totalElapsedMs: delta } });

    req.io?.to(`task:${taskId}`).emit("timer:stopped", { taskId, userId: String(_id), stoppedAt: now, delta });
    await ensureTicker(req.io, taskId); // tick will auto-stop if empty
    return sendSuccessResponse(res, 200, true, "Timer stopped", "timer", { stopped: true, delta });
  } catch (e) {
    console.log(e);

    next(e);
  }
};

export const activeSessions = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const isMember = await assertMember(taskId, req.user._id);
    if (!isMember) throw new ApiError("not_allowed", 404, "Task not found or not a member", true);

    const list = await TimerSession.find({ task: taskId, stoppedAt: null }).select("user startedAt");
    return sendSuccessResponse(res, 200, true, "Active sessions", "sessions", list);
  } catch (e) { next(e); }
};

export const forceStopAll = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const isMember = await assertMember(taskId, req.user._id);
    if (!isMember) throw new ApiError("not_allowed", 404, "Task not found or not a member", true);

    const actives = await TimerSession.find({ task: taskId, stoppedAt: null });
    let inc = 0;
    const now = new Date();
    for (const s of actives) {
      const delta = now.getTime() - new Date(s.startedAt).getTime();
      s.stoppedAt = now;
      s.elapsedMs = delta;
      await s.save();
      inc += delta;
    }
    if (inc) await Task.updateOne({ _id: taskId }, { $inc: { totalElapsedMs: inc } });

    req.io?.to(`task:${taskId}`).emit("timer:allStopped", { taskId, stoppedAt: now });
    return sendSuccessResponse(res, 200, true, "Forced stop", "result", { count: actives.length, addedMs: inc });
  } catch (e) { next(e); }
};
