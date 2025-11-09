import { JwtTokenUsageTypes } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import validateToken from '../utils/validateToken.js';

const authMiddleware = (model, usage = JwtTokenUsageTypes.Application) => {
    const authHandler = async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw new ApiError('Access denied', 401, 'Please provide you auth token', true);
            }
            // console.log("token", token);

            const getToken = validateToken(token);
            if (!getToken.token && getToken?.message) {
                throw new ApiError('Access denied', 401, getToken?.message, true);
            }
            const { user: { usage: userProvidedTokenUsage } } = getToken;
            if (userProvidedTokenUsage !== usage) {
                throw new ApiError('Access denied', 401, 'Sorry you dont have necessory permissions to perform this task', true);
            }
            let user = null;
            if (getToken.token) {
                user = await model.findOne({ _id: getToken.user.userId }).select('-__v -updatedAt');
                if (!user) {
                    throw new ApiError('Access denied', 401, 'User Not Found', true);
                }
            }
            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    };
    return authHandler;
};
export default authMiddleware;
