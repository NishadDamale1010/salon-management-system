const Notification = require("../models/Notification");
const FCMToken = require("../models/FCMToken");
const AppError = require("../utils/AppError");
const { getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

require("../firebase/firebaseAdmin");

const isDev = process.env.NODE_ENV !== "production";
const warnDev = (...args) => {
    if (isDev) console.warn(...args);
};

const INVALID_TOKEN_CODES = new Set([
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
]);

const saveDatabaseNotification = async (userId, type, title, body, options = {}) => {
    return Notification.create({
        user: userId,
        type,
        title,
        body,
        icon: options.icon,
        image: options.image,
        route: options.route,
    });
};

const getFirebaseMessaging = () => {
    if (getApps().length === 0) return null;
    return getMessaging();
};

const stringifyData = (data) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
            acc[key] = String(value);
        }
        return acc;
    }, {});
};

const buildPayloadData = ({ type, title, body, options = {}, notificationId }) => {
    return stringifyData({
        title,
        body,
        type: type || "System",
        route: options.route || "/notifications",
        icon: options.icon,
        image: options.image,
        notificationId,
    });
};

const buildWebpushConfig = (data) => {
    const route = data.route || "/notifications";
    const title = data.title || "Gayatri Beauty Studio";
    const body = data.body || "You have a new notification.";

    return {
        headers: {
            Urgency: "high",
        },
        notification: {
            title,
            body,
            icon: data.icon || data.image || "/icons/icon-192.png",
            badge: "/favicon.png",
            tag: data.notificationId || `${title}:${route}`,
            data: {
                ...data,
                route,
            },
            renotify: false,
            requireInteraction: false,
        },
        fcmOptions: {
            link: route,
        },
    };
};

const cleanupInvalidTokens = async (tokens, responses) => {
    const failedTokens = [];

    responses.forEach((response, index) => {
        if (!response.success && INVALID_TOKEN_CODES.has(response.error?.code)) {
            failedTokens.push(tokens[index]);
        }
    });

    if (failedTokens.length > 0) {
        await FCMToken.deleteMany({ token: { $in: failedTokens } });
    }
};

const sendToTokens = async (tokens, data) => {
    const messaging = getFirebaseMessaging();
    if (!messaging || tokens.length === 0) return false;

    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
    }

    try {
        for (const chunk of chunks) {
            const response = await messaging.sendEachForMulticast({
                tokens: chunk,
                notification: {
                    title: data.title || "Gayatri Beauty Studio",
                    body: data.body || "You have a new notification.",
                },
                data,
                webpush: buildWebpushConfig(data),
            });

            if (response.failureCount > 0) {
                await cleanupInvalidTokens(chunk, response.responses);
            }
        }

        return true;
    } catch (error) {
        warnDev("Error sending FCM multicast:", error);
        return false;
    }
};

const sendNotification = async (token, title, body, data = {}) => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return false;

    try {
        const payloadData = buildPayloadData({
            type: data.type,
            title,
            body,
            options: data,
            notificationId: data.notificationId,
        });

        await messaging.send({
            token,
            notification: {
                title,
                body,
            },
            data: payloadData,
            webpush: buildWebpushConfig(payloadData),
        });

        return true;
    } catch (error) {
        if (INVALID_TOKEN_CODES.has(error.code)) {
            await FCMToken.deleteOne({ token });
        } else {
            warnDev("Error sending FCM message:", error);
        }

        return false;
    }
};

const sendToUser = async (userId, type, title, body, options = {}) => {
    const dbNotification = await saveDatabaseNotification(userId, type, title, body, options);
    const userTokens = await FCMToken.find({ user: userId });
    const tokens = userTokens.map((item) => item.token);

    await sendToTokens(tokens, buildPayloadData({
        type,
        title,
        body,
        options,
        notificationId: dbNotification._id,
    }));

    return dbNotification;
};

const sendToMany = async (userIds, type, title, body, options = {}) => {
    const dbNotifications = [];

    for (const userId of userIds) {
        dbNotifications.push(await saveDatabaseNotification(userId, type, title, body, options));
    }

    const userTokens = await FCMToken.find({ user: { $in: userIds } });
    const tokensByUser = new Map();

    userTokens.forEach((item) => {
        const userId = item.user.toString();
        const tokens = tokensByUser.get(userId) || [];
        tokens.push(item.token);
        tokensByUser.set(userId, tokens);
    });

    for (const dbNotification of dbNotifications) {
        const tokens = tokensByUser.get(dbNotification.user.toString()) || [];
        await sendToTokens(tokens, buildPayloadData({
            type,
            title,
            body,
            options,
            notificationId: dbNotification._id,
        }));
    }

    return dbNotifications;
};

const createNotification = async (userId, type, title, body, options = {}) => {
    return sendToUser(userId, type, title, body, options);
};

const getUserNotifications = async (userId) => {
    return Notification.find({ user: userId }).sort("-createdAt").limit(50);
};

const markAsRead = async (userId, notificationId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { returnDocument: "after" }
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
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
