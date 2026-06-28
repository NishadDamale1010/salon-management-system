import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const cleanEnv = (val) => val ? val.replace(/^"|"$/g, '').trim() : undefined;

const firebaseConfig = {
    apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

const isDev = import.meta.env.DEV;
const warnDev = (...args) => {
    if (isDev) console.warn(...args);
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
        if (!messaging) {
            warnDev("Firebase messaging is not initialized.");
            return null;
        }

        const permission = Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if (permission !== "granted") {
            warnDev("Notification permission was not granted.");
            return null;
        }

        const vapidKey = cleanEnv(import.meta.env.VITE_VAPID_PUBLIC_KEY) || cleanEnv(import.meta.env.VITE_FIREBASE_VAPID_KEY);
        if (!vapidKey) {
            warnDev("VITE_VAPID_PUBLIC_KEY or VITE_FIREBASE_VAPID_KEY is not defined.");
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (!currentToken) {
            warnDev("No Firebase registration token was returned.");
            return null;
        }

        return currentToken;
    } catch (err) {
        console.error("An error occurred while retrieving token:", err);
        return null;
    }
};

/**
 * Subscribe to foreground messages. Returns a cleanup function.
 * Usage: const unsubscribe = await subscribeToForegroundMessages(callback);
 */
export const subscribeToForegroundMessages = async (callback) => {
    if (!messaging) return () => {};
    const unsubscribe = onMessage(messaging, (payload) => {
        callback(payload);
    });
    return unsubscribe;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { app, messaging };
