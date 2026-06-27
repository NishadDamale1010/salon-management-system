import api from "../services/api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Utility to convert Base64 string to Uint8Array for push manager
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return;
  }

  try {
    // Check permission
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return;
    }

    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe if not already subscribed
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Send the subscription object to our backend
    await api.post("/push/subscribe", { subscription });
    console.log("Successfully subscribed to push notifications");
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Unsubscribe on browser
      await subscription.unsubscribe();
      // Remove from backend
      await api.post("/push/unsubscribe", { endpoint: subscription.endpoint });
      console.log("Successfully unsubscribed from push notifications");
    }
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
  }
}
