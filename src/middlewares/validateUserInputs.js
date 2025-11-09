import { ApiError } from '../utils/ApiError.js';
import validateInputs from '../utils/validateInputs.js';

const validateUserInputs = (schema, request = 'body') => {
    const Handler = (req, res, next) => {
        try {
            const Query = request === 'body' ? req.body : req.query;
            const isError = validateInputs(schema, Query);
            if (isError) throw new ApiError('Validation error', 400, isError.message.replace(/"|\\/g, ''), true);
            next();
        } catch (error) {
            next(error);
        }
    };
    return Handler;
};
export default validateUserInputs;
