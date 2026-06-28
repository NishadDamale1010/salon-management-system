import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const cleanEnv = (val) => val ? val.replace(/^"|"$/g, "").trim() : undefined;
const isDev = import.meta.env.DEV;

const logDev = (...args) => {
    if (isDev) console.info(...args);
};

const warnDev = (...args) => {
    if (isDev) console.warn(...args);
};

const firebaseConfig = {
    apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
    measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

let app;
let messagingPromise;

try {
    if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
        app = initializeApp(firebaseConfig);
    } else {
        warnDev("Firebase web configuration is missing. Push notifications are disabled.");
    }
} catch (error) {
    warnDev("Error initializing Firebase:", error);
}

const hasNotificationSupport = () => (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    (window.isSecureContext || window.location.hostname === "localhost")
);

const getMessagingInstance = async () => {
    if (!app || !hasNotificationSupport()) return null;

    if (!messagingPromise) {
        messagingPromise = isSupported()
            .then((supported) => supported ? getMessaging(app) : null)
            .catch((error) => {
                warnDev("Firebase Messaging is not supported in this browser:", error);
                return null;
            });
    }

    return messagingPromise;
};

export const getNotificationPermissionStatus = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return "unsupported";
    }

    if (!("serviceWorker" in navigator) || (!window.isSecureContext && window.location.hostname !== "localhost")) {
        return "unsupported";
    }

    return Notification.permission;
};

export const requestFirebaseNotificationPermission = async () => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const permission = Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if (permission !== "granted") {
            warnDev("Notification permission was not granted.");
            return null;
        }

        const vapidKey = cleanEnv(import.meta.env.VITE_VAPID_PUBLIC_KEY)
            || cleanEnv(import.meta.env.VITE_FIREBASE_VAPID_KEY);
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

        logDev("Firebase notification token retrieved.");
        return currentToken;
    } catch (error) {
        warnDev("An error occurred while retrieving the Firebase token:", error);
        return null;
    }
};

export const subscribeToForegroundMessages = async (handler) => {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    return onMessage(messaging, handler);
};

export { app };
