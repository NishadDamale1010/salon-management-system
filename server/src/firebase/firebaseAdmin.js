const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";
const warnDev = (...args) => {
    if (isDev) console.warn(...args);
};
const logDev = (...args) => {
    if (isDev) console.info(...args);
};

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        try {
            serviceAccount = require(path.resolve(__dirname, "../../firebaseServiceAccount.json"));
        } catch (_error) {
            warnDev("Firebase Admin credentials not found. Notifications will not be sent.");
        }
    }

    if (serviceAccount && getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount),
        });
        logDev("Firebase Admin SDK initialized successfully.");
    }
} catch (error) {
    warnDev("Error initializing Firebase Admin SDK:", error);
}

module.exports = {
    apps: getApps(),
    messaging: getMessaging,
};
