const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @desc    Subscribe a device for push notifications
// @route   POST /api/push/subscribe
// @access  Private
exports.subscribe = asyncHandler(async (req, res, next) => {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
        return next(new AppError("Invalid push subscription object", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Check if subscription already exists for this user to avoid duplicates
    const existingSub = user.pushSubscriptions.find(sub => sub.endpoint === subscription.endpoint);
    
    if (!existingSub) {
        user.pushSubscriptions.push(subscription);
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: "Push subscription saved successfully"
    });
});

// @desc    Unsubscribe a device from push notifications
// @route   POST /api/push/unsubscribe
// @access  Private
exports.unsubscribe = asyncHandler(async (req, res, next) => {
    const { endpoint } = req.body;

    if (!endpoint) {
        return next(new AppError("Subscription endpoint is required", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Push subscription removed successfully"
    });
});
