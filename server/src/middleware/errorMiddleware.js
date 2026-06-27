const sendResponse = require("../utils/sendResponse");

const errorMiddleware = (err, req, res, next) => {
    console.error("SERVER ERROR LOG:", err);
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongo Duplicate Key
    if (err.code === 11000) {
        statusCode = 400;
        message = `${Object.keys(err.keyValue)} already exists`;
    }

    // Invalid Mongo ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID";
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid Token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token Expired";
    }

    return sendResponse(
        res,
        statusCode,
        false,
        message
    );
};

module.exports = errorMiddleware;