const notificationService = require("../services/notificationService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

exports.getUserNotifications = asyncHandler(async (req, res) => {
    const data = await notificationService.getUserNotifications(req.user._id);
    sendResponse(res, 200, true, "Notifications retrieved successfully", data);
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const data = await notificationService.markAsRead(req.user._id, req.params.id);
    sendResponse(res, 200, true, "Notification marked as read", data);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
    const data = await notificationService.markAllAsRead(req.user._id);
    sendResponse(res, 200, true, data.message, null);
});

exports.deleteNotification = asyncHandler(async (req, res) => {
    const data = await notificationService.deleteNotification(req.user._id, req.params.id);
    sendResponse(res, 200, true, data.message, null);
});

const FCMToken = require("../models/FCMToken");

exports.registerToken = asyncHandler(async (req, res) => {
    const { token, device, platform } = req.body;
    if (!token) return sendResponse(res, 400, false, "Token is required");

    // Remove if token exists for another user or update existing
    await FCMToken.findOneAndUpdate(
        { token },
        {
            user: req.user._id,
            device: device || "Unknown",
            platform: platform || "web",
            lastSeen: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
    );

    sendResponse(res, 200, true, "FCM Token registered successfully");
});

exports.removeToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return sendResponse(res, 400, false, "Token is required");

    await FCMToken.findOneAndDelete({ token, user: req.user._id });
    sendResponse(res, 200, true, "FCM Token removed successfully");
});
const User = require("../models/User");

exports.broadcastNotification = asyncHandler(async (req, res) => {
    const { audience, title, body, route } = req.body;
    
    let users = [];
    
    if (audience === "all") {
        users = await User.find({ role: "customer" });
    } else if (audience === "high_points") {
        users = await User.find({ role: "customer", glowPoints: { $gte: 100 } });
    } else if (audience === "inactive") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        users = await User.find({ role: "customer", lastLogin: { $lt: thirtyDaysAgo } });
    }
    
    if (users.length === 0) {
        return sendResponse(res, 400, false, "No users found in this audience segment");
    }
    
    const userIds = users.map(u => u._id);
    
    await notificationService.sendToMany(userIds, "System", title, body, { route });
    
    sendResponse(res, 200, true, `Broadcast sent to ${users.length} users`);
});
