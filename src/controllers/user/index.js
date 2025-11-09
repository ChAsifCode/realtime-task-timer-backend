import { ApiError } from "../../utils/ApiError.js";
import { createUser, findUserByEmail, getAllUsers } from "./service.js";
import sendSuccessResponse from "../../utils/responses/sendSuccessResponse.js";
import SEND_SANITIZED_SUCCESS_RESPONSE from "../../utils/responses/sendSanitizedSuccessResponse.js";
import { generateToken } from "../../utils/jwtHelper.js";
import { JwtTokenUsageTypes } from "../../constants/index.js";

const signup = async (req, res, next) => {
    try {
        const { body: { firstName, lastName, email, password } } = req;
        const isEmailExist = await findUserByEmail(email);
        if (isEmailExist) {
            throw new ApiError('Validation_error', 400, 'User already exist', true);
        }
        const user = await createUser({ firstName, lastName, email, password });
        if (!user) {
            throw new ApiError('Db_error', 400, 'User not created', true);
        }
        const token = generateToken(
            { userId: user._id, usage: JwtTokenUsageTypes.verifySignin },
            "30d"
        );
        return sendSuccessResponse(
            res,
            200,
            true,
            "User created successfully",
            "user",
            { user: SEND_SANITIZED_SUCCESS_RESPONSE(user), token }
        );
    }
    catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const {
            body: { otp, otpType },
            user,
        } = req;
        if (user.otpType !== otpType) {
            throw new ApiError("invalid_otp_type", 400, "Invalid OTP type", true);
        }
        if (user.otpExpiry < Date.now()) {
            throw new ApiError("otp_expired", 400, "OTP has expired", true);
        }
        if (user.otp !== otp) {
            throw new ApiError("invalid_otp", 400, "Invalid OTP", true);
        }
        await user.updateOne({
            $set: {
                isVerified: true,
                otp: null,
                otpType: null,
                otpExpiry: null,
                otpVerified: true,
            },
        });
        let token = null;
        if (user.otpType === "password_reset") {
            token = generateToken(
                { userId: user._id, usage: JwtTokenUsageTypes.ForgetPassword },
                "10m"
            );
        }
        return sendSuccessResponse(
            res,
            200,
            true,
            "Email verified successfully",
            "user",
            { user: SEND_SANITIZED_SUCCESS_RESPONSE(user), token }
        );
    } catch (error) {
        next(error);
    }
};
const loginUser = async (req, res, next) => {
    try {
        const {
            body: { email, password },
        } = req;
        const user = await findUserByEmail(email);
        if (!user) {
            throw new ApiError("user_not_found", 400, "User not found", true);
        }
        if (!user.isVerified) {
            throw new ApiError(
                "user_not_active",
                400,
                "kindly verify your email first",
                true
            );
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            throw new ApiError(
                "invalid_credentials",
                400,
                "Invalid credentials",
                true
            );
        }
        const token = generateToken(
            { userId: user._id, usage: JwtTokenUsageTypes.Application },
            "30d"
        );
        return sendSuccessResponse(
            res,
            200,
            true,
            "User logged in successfully",
            "user",
            { user: SEND_SANITIZED_SUCCESS_RESPONSE(user), token }
        );
    } catch (error) {
        next(error);
    }
};

export {
    signup,
    verifyEmail,
    loginUser,
}