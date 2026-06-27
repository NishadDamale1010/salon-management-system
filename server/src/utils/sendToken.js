const generateToken = require("./generateToken");

const sendResponse = require("./sendResponse");

const sendToken = (
    user,
    statusCode,
    message,
    res
) => {

    const token = generateToken(user);

    const isProduction = process.env.NODE_ENV === "production" || 
                         (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost"));

    const options = {

        httpOnly: true,

        secure: isProduction,

        sameSite: isProduction ? "none" : "lax",

        maxAge:
            30 *
            24 *
            60 *
            60 *
            1000,
    };

    res.cookie(
        "token",
        token,
        options
    );

    user.password = undefined;

    return sendResponse(
        res,
        statusCode,
        true,
        message,
        {
            user,
            token,
        }
    );
};

module.exports = sendToken;