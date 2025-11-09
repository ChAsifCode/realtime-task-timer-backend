import { User } from "../../models/index.js";
import { sendEmail } from "../../utils/sendEmail.js";

const createUser = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const otpType = "email_verification";
    const otpVerified = false;
    const users = await User.create({ ...user, otp, otpExpiry, otpType, otpVerified });
    await sendEmail({ to: user.email, subject: "Verify your email", text: `Your verification code is ${otp}` });
    return users;
};
const findUserByEmail = async (email) => {
    const user = await User.findOne({ email, isActive: true });
    return user;
};
const getAllUsers = async ({ search, page = 1, limit = 10 }) => {
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        User.countDocuments(query),
    ]);
    return {
        users,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
};

export {
    createUser,
    findUserByEmail,
    getAllUsers,
};
