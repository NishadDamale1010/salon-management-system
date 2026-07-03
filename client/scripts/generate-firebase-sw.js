import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const loadEnvFile = (filePath) => {
    if (!fs.existsSync(filePath)) return {};

    return fs.readFileSync(filePath, "utf8")
        .split("\n")
        .reduce((env, line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return env;

            const separatorIndex = trimmed.indexOf("=");
            if (separatorIndex === -1) return env;

            const key = trimmed.slice(0, separatorIndex).trim();
            const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
            env[key] = value;
            return env;
        }, {});
};

const env = {
    ...loadEnvFile(path.join(rootDir, ".env")),
    ...loadEnvFile(path.join(rootDir, ".env.local")),
    ...process.env,
};

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
};

const swContents = `importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 4)};

// 1. Register our click listener FIRST so Firebase doesn't stop it
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // Firebase natively handles 'webpush.notification' by wrapping data in FCM_MSG
    let payloadData = event.notification.data || {};
    if (payloadData.FCM_MSG && payloadData.FCM_MSG.data) {
        payloadData = payloadData.FCM_MSG.data;
    }

    const route = payloadData.route || "/";
    const urlToOpen = new URL(route, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    if ("navigate" in client) {
                        return client.navigate(urlToOpen).then(() => client.focus());
                    }
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log("[firebase-messaging-sw.js] Received background message ", payload);

        const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.body,
            icon: payload.notification?.image || "/favicon.png",
            badge: "/favicon.png",
            data: payload.data || {},
            vibrate: [100, 50, 100],
            requireInteraction: false,
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}
`;

const outputPath = path.join(rootDir, "public", "firebase-messaging-sw.js");
fs.writeFileSync(outputPath, swContents, "utf8");

if (!firebaseConfig.apiKey) {
    console.warn("⚠️  Firebase env vars missing. Generated firebase-messaging-sw.js with empty config.");
} else {
    console.log("✅ Generated firebase-messaging-sw.js from environment variables.");
}
