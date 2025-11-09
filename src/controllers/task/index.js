import { ApiError } from "../../utils/ApiError.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import { Task } from "../../models/index.js";

export const createTask = async (req, res, next) => {
    try {
        const { title, description = "", members = [] } = req.body;
        const uniqMembers = Array.from(new Set([req.user._id, ...members]));
        const doc = await Task.create({
            title, description, user: req.user._id, members: uniqMembers
        });
        return sendSuccessResponse(res, 201, true, "Task created", "task", doc);
    } catch (e) {
        next(e);
    }
};

export const myTasks = async (req, res, next) => {
    try {
        const docs = await Task.find({ members: req.user._id }).sort({ updatedAt: -1 });
        return sendSuccessResponse(res, 200, true, "Tasks fetched", "tasks", docs);
    } catch (e) {
        next(e);
    }
};

export const getTask = async (req, res, next) => {
    try {
        const doc = await Task.findOne({ _id: req.params.id, members: req.user._id });
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        return sendSuccessResponse(res, 200, true, "Task fetched", "task", doc);
    } catch (e) {
        next(e);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const doc = await Task.findOneAndUpdate(
            { _id: req.params.id, members: req.user._id },
            { $set: { ...(title && { title }), ...(description !== undefined && { description }) } },
            { new: true }
        );
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        // realtime broadcast
        req.io?.to(`task:${doc._id}`).emit("task:updated", { taskId: doc._id, title: doc.title, description: doc.description });
        return sendSuccessResponse(res, 200, true, "Task updated", "task", doc);
    } catch (e) {
        next(e);
    }
};

export const removeTask = async (req, res, next) => {
    try {
        const doc = await Task.findOne({ _id: req.params.id, members: req.user._id });
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        await doc.deleteOne();
        return sendSuccessResponse(res, 200, true, "Task deleted", "task", { _id: req.params.id });
    } catch (e) {
        next(e);
    }
};

export const addMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const doc = await Task.findOneAndUpdate(
            { _id: req.params.id, members: req.user._id },
            { $addToSet: { members: userId } },
            { new: true }
        );
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        req.io?.to(`task:${doc._id}`).emit("task:membersUpdated", { taskId: doc._id });
        return sendSuccessResponse(res, 200, true, "Member added", "task", doc);
    } catch (e) {
        next(e);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const doc = await Task.findOneAndUpdate(
            { _id: req.params.id, members: req.user._id },
            { $pull: { members: userId } },
            { new: true }
        );
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        req.io?.to(`task:${doc._id}`).emit("task:membersUpdated", { taskId: doc._id });
        return sendSuccessResponse(res, 200, true, "Member removed", "task", doc);
    } catch (e) {
        next(e);
    }
};
export const getTotal = async (req, res, next) => {
    try {
        const doc = await Task.findOne({ _id: req.params.id, members: req.user._id }).lean();
        if (!doc) throw new ApiError("not_found", 404, "Task not found", true);
        return sendSuccessResponse(res, 200, true, "Total persisted", "total", { totalElapsedMs: doc.totalElapsedMs });
    } catch (e) {
        next(e);
    }
};
