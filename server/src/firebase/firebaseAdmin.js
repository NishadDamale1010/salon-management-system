const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");

try {
    let serviceAccount;
    
    // Check if the environment variable for Firebase Admin credentials exists as a JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback: try to read from a local file for development if provided
        try {
            serviceAccount = require(path.resolve(__dirname, "../../firebaseServiceAccount.json"));
        } catch (err) {
            console.warn("⚠️  Firebase Admin credentials not found. Notifications will not be sent.");
        }
    }

    if (serviceAccount && getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log("🔥 Firebase Admin SDK Initialized Successfully.");
    }
} catch (error) {
    console.error("🔥 Error initializing Firebase Admin SDK:", error);
}

// Export the messaging service directly or a wrapper object to act like admin
module.exports = {
    apps: getApps(),
    messaging: getMessaging
};
