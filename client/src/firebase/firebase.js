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
            const vapidKey = cleanEnv(import.meta.env.VITE_VAPID_PUBLIC_KEY) || cleanEnv(import.meta.env.VITE_FIREBASE_VAPID_KEY);
            if (!vapidKey) {
                console.warn("VITE_FIREBASE_VAPID_KEY is not defined.");
            }

            // Use the active service worker registration from Vite PWA
            const registration = await navigator.serviceWorker.ready;

            const currentToken = await getToken(messaging, { 
                vapidKey,
                serviceWorkerRegistration: registration 
            });
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
