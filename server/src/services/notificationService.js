const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const webpush = require("web-push");

// Configure web-push with VAPID keys
// This requires VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT in .env
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@gayatri-beauty.com",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

exports.getUserNotifications = async (userId) => {
    return Notification.find({ user: userId }).sort("-createdAt").limit(50);
};

exports.markAsRead = async (userId, notificationId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
    );
    if (!notification) throw new AppError("Notification not found", 404);
    return notification;
};

exports.markAllAsRead = async (userId) => {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { success: true, message: "All notifications marked as read" };
};

exports.deleteNotification = async (userId, notificationId) => {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
    if (!notification) throw new AppError("Notification not found", 404);
    return { success: true, message: "Notification deleted" };
};

exports.createNotification = async (userId, type, title, message) => {
    const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
    });

    try {
        const user = await User.findById(userId).select("+pushSubscriptions");
        if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
            const payload = JSON.stringify({
                title,
                body: message,
                icon: "/favicon.png", // or a specific push icon
                url: "/dashboard"
            });

            // Send push to all subscriptions concurrently
            const pushPromises = user.pushSubscriptions.map(sub => 
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error("Push notification failed for a subscription:", err);
                    // Could potentially remove invalid subscriptions here (e.g. if status is 410 Gone)
                })
            );

            await Promise.all(pushPromises);
        }
    } catch (error) {
        console.error("Error sending web push notification:", error);
    }

    return notification;
};
