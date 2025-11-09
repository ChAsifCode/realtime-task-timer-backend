class BaseError extends Error {
    static name;
    static httpCode;
    static isOperational;
    static description;
    static errorType;

    constructor(name, httpCode, description, isOperational, errorType) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        this.description = description;
        this.errorType = errorType;

        Error.captureStackTrace(this);
    }
}

export default BaseError;
