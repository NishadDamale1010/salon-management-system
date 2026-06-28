import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let messaging;

try {
    // Only initialize if config is present to prevent crashing if user hasn't set env vars yet
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);
    } else {
        console.warn("⚠️ Firebase configuration is missing. Push notifications will not work.");
    }
} catch (error) {
    console.error("🔥 Error initializing Firebase:", error);
}

export const requestFirebaseNotificationPermission = async () => {
    try {
        if (!messaging) throw new Error("Firebase Messaging not initialized");

        console.log("Requesting notification permission...");
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                console.warn("VITE_FIREBASE_VAPID_KEY is not defined.");
            }

            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
                return currentToken;
            } else {
                console.warn("No registration token available. Request permission to generate one.");
                return null;
            }
        } else {
            console.warn("Notification permission denied.");
            return null;
        }
    } catch (err) {
        console.error("An error occurred while retrieving token:", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { app, messaging };
