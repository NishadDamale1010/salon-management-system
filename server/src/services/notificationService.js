const Notification = require("../models/Notification");
const FCMToken = require("../models/FCMToken");
const AppError = require("../utils/AppError");
const { getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

// We still need to require firebaseAdmin to ensure it initializes
require("../firebase/firebaseAdmin");

/**
 * Save notification to MongoDB
 */
const saveDatabaseNotification = async (userId, type, title, body, options = {}) => {
    return await Notification.create({
        user: userId,
        type,
        title,
        body,
        icon: options.icon,
        image: options.image,
        route: options.route,
    });
};

/**
 * Send FCM push notification to a specific token
 */
const sendNotification = async (token, title, body, data = {}) => {
    if (getApps().length === 0) return false;

    try {
        const message = {
            notification: {
                title,
                body,
                ...(data.image && { image: data.image })
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK", // for cross-platform support
                route: data.route || "/",
                type: data.type || "System"
            },
            token,
        };

        const response = await getMessaging().send(message);
        console.log("Successfully sent FCM message:", response);
        return true;
    } catch (error) {
        console.error("Error sending FCM message:", error);
        
        // Handle invalid tokens
        if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
            await FCMToken.deleteOne({ token });
        }
        
        return false;
    }
};

/**
 * Send push notification to a single user (all their devices)
 */
const sendToUser = async (userId, type, title, body, options = {}) => {
    // 1. Save to DB
    const dbNotification = await saveDatabaseNotification(userId, type, title, body, options);

    // 2. Fetch all FCM tokens for user
    const userTokens = await FCMToken.find({ user: userId });
    
    if (userTokens.length > 0 && getApps().length > 0) {
        const tokens = userTokens.map(t => t.token);
        
        const message = {
            notification: {
                title,
                body,
                ...(options.image && { image: options.image })
            },
            data: {
                route: options.route || "/",
                type: type || "System",
                notificationId: dbNotification._id.toString()
            },
            tokens,
        };

        try {
            const response = await getMessaging().sendEachForMulticast(message);
            
            // Clean up invalid tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        if (resp.error.code === 'messaging/invalid-registration-token' || 
                            resp.error.code === 'messaging/registration-token-not-registered') {
                            failedTokens.push(tokens[idx]);
                        }
                    }
                });
                
                if (failedTokens.length > 0) {
                    await FCMToken.deleteMany({ token: { $in: failedTokens } });
                }
            }
        } catch (error) {
            console.error("Error sending multicast message:", error);
        }
    }

    return dbNotification;
};

/**
 * Send push notification to multiple users
 */
const sendToMany = async (userIds, type, title, body, options = {}) => {
    const dbNotifications = [];
    
    for (const userId of userIds) {
        dbNotifications.push(
            await saveDatabaseNotification(userId, type, title, body, options)
        );
    }

    const userTokens = await FCMToken.find({ user: { $in: userIds } });
    
    if (userTokens.length > 0 && getApps().length > 0) {
        const tokens = userTokens.map(t => t.token);
        
        const message = {
            notification: {
                title,
                body,
                ...(options.image && { image: options.image })
            },
            data: {
                route: options.route || "/",
                type: type || "System"
            },
            tokens,
        };

        try {
            const response = await getMessaging().sendEachForMulticast(message);
            
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && 
                        (resp.error.code === 'messaging/invalid-registration-token' || 
                         resp.error.code === 'messaging/registration-token-not-registered')) {
                        failedTokens.push(tokens[idx]);
                    }
                });
                
                if (failedTokens.length > 0) {
                    await FCMToken.deleteMany({ token: { $in: failedTokens } });
                }
            }
        } catch (error) {
            console.error("Error sending bulk multicast:", error);
        }
    }
    
    return dbNotifications;
};

// Compatibility wrapper for old createNotification calls
const createNotification = async (userId, type, title, body) => {
    return await sendToUser(userId, type, title, body);
};

// Existing logic for retrieving/managing notifications
const getUserNotifications = async (userId) => {
    return Notification.find({ user: userId }).sort("-createdAt").limit(50);
};

const markAsRead = async (userId, notificationId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { returnDocument: 'after' }
    );
    if (!notification) throw new AppError("Notification not found", 404);
    return notification;
};

const markAllAsRead = async (userId) => {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { success: true, message: "All notifications marked as read" };
};

const deleteNotification = async (userId, notificationId) => {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
    if (!notification) throw new AppError("Notification not found", 404);
    return { success: true, message: "Notification deleted" };
};

module.exports = {
    saveDatabaseNotification,
    sendNotification,
    sendToUser,
    sendToMany,
    createNotification, // Kept for backwards compatibility
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
