importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    "apiKey": "AIzaSyB9fOj3Aqfjj3KijM6CVYV7PPqNw8No0dw",
    "authDomain": "salon-management-554d6.firebaseapp.com",
    "projectId": "salon-management-554d6",
    "storageBucket": "salon-management-554d6.firebasestorage.app",
    "messagingSenderId": "710416836437",
    "appId": "1:710416836437:web:25e28f9a73c7d9153571dc"
};

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
