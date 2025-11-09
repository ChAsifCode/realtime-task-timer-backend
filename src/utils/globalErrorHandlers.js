import mongoose from "mongoose";
import errorHandler from "./Errorhandler.js";
import print from "./print.js";
import { HTTP404Error } from "./ApiError.js";
import logger from "../logger/index.js";

function globalErrorHandlerMiddleware(err, req, res, next) {
    if (!errorHandler.isTrustedError(err)) {
        next(err);
    }
    errorHandler.handleError(err);
    return res.status(err?.httpCode ?? 500).json({
        name: err.name,
        status: err?.httpCode ?? 500,
        success: false,
        error: true,
        message: err?.message,
        errorType: err?.errorType,
    });
}

function handleUncaughtException(error) { // Uncaught Exception occurs when an exception is not caught by a programming construct or by the programmer,
    print("error", `uncaughtException : ${error.message}`);
    mongoose.disconnect();
    errorHandler.handleUncaughtException(error);
    process.exit(1);
}

function handleUnhandledRejection(error) { // The unhandledrejection event is sent to the global scope of a script when a JavaScript Promise that has no rejection handler is rejected;
    print("error", `unhandledRejection : ${error.message}`);
    mongoose.disconnect();
    errorHandler.handleUncaughtException(error);
    process.exit(1);
}
function handleSIGINT() {
    mongoose.connection.close(() => {
        logger.error("Node is down. So the Mongoose.");
        mongoose.disconnect();
        process.exit(1);
    });
}
function handleApiNotFound(req, res, next) {
    console.log(req.url);
    
    const error = new HTTP404Error("The API you are trying to access isn't found");
    next(error);
}
export {
    globalErrorHandlerMiddleware,
    handleApiNotFound,
    handleUncaughtException,
    handleUnhandledRejection,
    handleSIGINT,
};
