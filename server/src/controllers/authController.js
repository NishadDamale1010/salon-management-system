const asyncHandler = require("../utils/asyncHandler");

const sendToken = require("../utils/sendToken");

const sendResponse = require("../utils/sendResponse");

const authService = require("../services/authService");

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

exports.logout = asyncHandler(async (req, res) => {

    res.cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
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