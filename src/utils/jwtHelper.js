import jwt from "jsonwebtoken";
import config from "../config/keys.js";

const generateToken = (payload, expiresIn = "7d") => {
    return jwt.sign(payload, config.JWT.SECRET, { expiresIn });
};
const verifyToken = (token) => jwt.verify(token, config.JWT.SECRET);

export { generateToken, verifyToken };
