const User = require("../models/User");
const AppError = require("../utils/AppError");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const updateCurrentUser = async (id, data) => {
    // Only allow updating specific fields
    const { firstName, lastName, phone, instagram } = data;
    
    // Check if phone is already taken by another user
    if (phone) {
        const existingPhone = await User.findOne({ phone, _id: { $ne: id } });
        if (existingPhone) {
            throw new AppError("Phone number already in use", 400);
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { firstName, lastName, phone, instagram },
        { returnDocument: 'after', runValidators: true }
    );
    return updatedUser;
};

const googleLogin = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    let user = await User.findOne({ email }).select("+password");

    if (!user) {
        user = await User.create({
            firstName: given_name || "User",
            lastName: family_name || "Name",
            email: email,
            phone: `google_${Date.now()}_${sub.slice(-4)}`,
            password: crypto.randomBytes(16).toString("hex"),
            googleId: sub,
            isVerified: true
        });
    } else {
        if (!user.googleId) {
            user.googleId = sub;
            user.isVerified = true;
            await user.save();
        }
    }

    return user;
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    googleLogin,
};