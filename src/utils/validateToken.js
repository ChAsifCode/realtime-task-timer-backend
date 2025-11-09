import jwt from 'jsonwebtoken';
import ENV from '../config/keys.js';

function validateToken(token) {
    try {
        if (!token) {
            return {
                token: false,
                message: 'Access denied. No token provided.',
            };
        }
        const bearer = token.split(' ');
        const [, bearerToken] = bearer;
        // console.log("bearerToken", bearerToken);
        const decoded = jwt.verify(bearerToken, ENV.JWT.SECRET);
        if (!decoded.userId) {
            return {
                token: false,
                message: 'Access denied. Token is malformed',
            };
        }
        return {
            token: true,
            user: decoded,
        };
    } catch (error) {
        return {
            token: false,
            message: error.message,
        };
    }
}
export default validateToken;
