const User = require("../models/User");
const AppError = require("../utils/AppError");

const registerUser = async (userData) => {
    const { firstName, lastName, email, phone, password } = userData;

    const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (existingUser) {
        throw new AppError(
            "Email or Phone already registered",
            400
        );
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
    });

    return user;
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new AppError("Invalid Credentials", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new AppError("Invalid Credentials", 401);
    }

    return user;
};

const getCurrentUser = async (id) => {
    return await User.findById(id);
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
};