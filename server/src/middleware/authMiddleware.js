const jwt = require("jsonwebtoken");

const User = require("../models/User");

const AppError = require("../utils/AppError");

const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {

    let token = req.cookies.token;

    // Also check Authorization header for cross-domain (Vercel <-> Render)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new AppError("Please login first", 401);
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    req.user = user;

    next();
});

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "Access Denied",
                    403
                )
            );
        }

        next();
    };
};

module.exports = {
    protect,
    authorize,
};