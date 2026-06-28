importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyB9fOj3Aqfjj3KijM6CVYV7PPqNw8No0dw",
    authDomain: "salon-management-554d6.firebaseapp.com",
    projectId: "salon-management-554d6",
    storageBucket: "salon-management-554d6.firebasestorage.app",
    messagingSenderId: "710416836437",
    appId: "1:710416836437:web:25e28f9a73c7d9153571dc",
};

const getSafeRoute = (route) => {
    if (!route || typeof route !== "string") return "/notifications";
    if (route.startsWith("/")) return route;

    try {
        const url = new URL(route);
        return url.origin === self.location.origin ? `${url.pathname}${url.search}${url.hash}` : "/notifications";
    } catch (_error) {
        return "/notifications";
    }
};

if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        const data = payload.data || {};
        const notification = payload.notification || {};

        // When the backend sends a Web Push notification payload, the browser can
        // display it even when the app is closed. Avoid manually showing it twice.
        if (notification.title || notification.body) return;

        const title = data.title || "Gayatri Beauty Studio";
        const body = notification.body || data.body || "You have a new notification.";
        const route = getSafeRoute(data.route);

        self.registration.showNotification(title, {
            body,
            icon: notification.image || data.image || "/icons/icon-192.png",
            badge: "/favicon.png",
            data: {
                ...data,
                route,
            },
            tag: data.notificationId || `${title}:${route}`,
            renotify: false,
        });
    });
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const route = getSafeRoute(event.notification.data?.route);
    const urlToOpen = new URL(route, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.startsWith(self.location.origin) && "focus" in client) {
                    if ("navigate" in client) {
                        return client.navigate(urlToOpen).then(() => client.focus());
                    }
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }

            return undefined;
        })
    );
});
