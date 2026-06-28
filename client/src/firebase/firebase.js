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

const defaultFirebaseConfig = {
    apiKey: "AIzaSyB9fOj3Aqfjj3KijM6CVYV7PPqNw8No0dw",
    authDomain: "salon-management-554d6.firebaseapp.com",
    projectId: "salon-management-554d6",
    storageBucket: "salon-management-554d6.firebasestorage.app",
    messagingSenderId: "710416836437",
    appId: "1:710416836437:web:25e28f9a73c7d9153571dc",
    measurementId: "G-EDZQPHDB0X",
};

const firebaseConfig = {
    apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY) || defaultFirebaseConfig.apiKey,
    authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || defaultFirebaseConfig.authDomain,
    projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || defaultFirebaseConfig.projectId,
    storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || defaultFirebaseConfig.storageBucket,
    messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || defaultFirebaseConfig.messagingSenderId,
    appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || defaultFirebaseConfig.appId,
    measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || defaultFirebaseConfig.measurementId,
};

const defaultVapidPublicKey = [
    "BNuwRmFSkrZRiJFb-VNHuGcilac5owKvJxg5jclUo4wZmQZMEAaR1NzKJYgYnbqrig",
    "TksbhYLLc_KHjdAHWYZLE",
].join("");

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
            || cleanEnv(import.meta.env.VITE_FIREBASE_VAPID_KEY)
            || defaultVapidPublicKey;
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
