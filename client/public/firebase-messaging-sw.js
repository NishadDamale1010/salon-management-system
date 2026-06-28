importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// We can't use import.meta.env here since it's not processed by Vite
// We have to rely on a dynamic way or hardcode it during build. 
// A common approach is to append the config to the url or fetch it.
// For simplicity in Vite, we often just read from URL query params if registered dynamically,
// OR since it's a PWA, we can initialize it with the firebase config.
// The easiest approach for PWA with Vite is to have the service worker registered
// in the app where env vars are available, and pass config via query string, or
// use a separate build step for SW. 
// A simpler robust way: provide a generic placeholder or instruct to fill.
// Since we are writing the file directly, we will use placeholder comments 
// for the user to replace, or a fetch approach.
// Actually, firebase-messaging-sw.js requires config for compat lib:

// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyB9fOj3Aqfjj3KijM6CVYV7PPqNw8No0dw",
    authDomain: "salon-management-554d6.firebaseapp.com",
    projectId: "salon-management-554d6",
    storageBucket: "salon-management-554d6.firebasestorage.app",
    messagingSenderId: "710416836437",
    appId: "1:710416836437:web:25e28f9a73c7d9153571dc"
};

// Only initialize if we have actual values (not placeholders)
if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log("[firebase-messaging-sw.js] Received background message ", payload);
        
        const notificationTitle = payload.notification?.title || "New Notification";
        const notificationOptions = {
            body: payload.notification?.body,
            icon: payload.notification?.image || "/favicon.png",
            badge: "/favicon.png", // Small white icon for Android status bar
            data: payload.data, // Contains routing info
            vibrate: [100, 50, 100],
            requireInteraction: false
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

// Handle notification clicks for deep linking
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.', event);
    event.notification.close();

    const route = event.notification.data?.route || "/";
    const urlToOpen = new URL(route, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
