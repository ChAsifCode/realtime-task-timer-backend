import joi from "joi";

const signupSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required(),
    firstName: joi.string().min(2).max(100).required(),
    lastName: joi.string().min(2).max(100).optional(),
}).unknown(false).options({ abortEarly: false });

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
}).options({ abortEarly: false });

const verifyEmailSchema = joi.object({
    otp: joi.string().required(),
    otpType: joi.string().valid('password_reset', 'email_verification').required(),
}).options({ abortEarly: false });

export {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
};