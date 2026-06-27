const asyncHandler = require("../utils/asyncHandler");

const sendToken = require("../utils/sendToken");

const sendResponse = require("../utils/sendResponse");

const authService = require("../services/authService");
const adminService = require("../services/adminService");

exports.register = asyncHandler(async (req, res) => {

    const user = await authService.registerUser(req.body);

    sendToken(
        user,
        201,
        "Registration Successful",
        res
    );

});

exports.login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await authService.loginUser(
        email,
        password
    );

    sendToken(
        user,
        200,
        "Login Successful",
        res
    );

});

exports.googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new AppError("Google token is required", 400);

    const user = await authService.googleLogin(token);
    
    sendToken(
        user,
        200,
        "Google Login Successful",
        res
    );
});

exports.logout = asyncHandler(async (req, res) => {

    const isProduction = process.env.NODE_ENV === "production" || 
                         (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost"));

    res.cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });

    sendResponse(
        res,
        200,
        true,
        "Logout Successful"
    );

});

exports.getMe = asyncHandler(async (req, res) => {

    const user = await authService.getCurrentUser(
        req.user._id
    );

    sendResponse(
        res,
        200,
        true,
        "User Profile",
        user
    );

});

exports.updateMe = asyncHandler(async (req, res) => {
    const updatedUser = await authService.updateCurrentUser(req.user._id, req.body);
    sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
});

exports.getLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await adminService.getLeaderboard();
    sendResponse(res, 200, true, "Leaderboard retrieved successfully", leaderboard);
});