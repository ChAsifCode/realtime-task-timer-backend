import joi from "joi";
export const paramTaskIdSchema = joi.object({
  taskId: joi.string().required(),
});
