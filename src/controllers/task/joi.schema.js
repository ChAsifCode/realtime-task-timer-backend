import joi from "joi";

export const createTaskSchema = joi.object({
    title: joi.string().min(1).required(),
    description: joi.string().allow("").optional(),
    members: joi.array().items(joi.string()).optional()
}).unknown(false);

export const updateTaskSchema = joi.object({
    title: joi.string().min(1).optional(),
    description: joi.string().allow("").optional()
}).unknown(false);

export const memberSchema = joi.object({
    userId: joi.string().required()
}).unknown(false);
