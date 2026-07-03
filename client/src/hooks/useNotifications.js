import { useState, useEffect, useCallback, useRef } from "react";
import { requestFirebaseNotificationPermission, subscribeToForegroundMessages } from "../firebase/firebase";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants/queryKeys";

const isDev = import.meta.env.DEV;
const warnDev = (...args) => {
    if (isDev) console.warn(...args);
};

// ── Shared singleton foreground listener ──────────────────────────────
// Because the hook is used in multiple components simultaneously,
// we use a module-level event bus so only ONE Firebase onMessage
// subscription exists, and every mounted hook instance receives events.
const listeners = new Set();
let sharedUnsubscribe = null;
let sharedSubscribing = false;

const notifyListeners = (payload) => {
    listeners.forEach((fn) => {
        try { fn(payload); } catch (e) { console.error(e); }
    });
};

const ensureForegroundListener = () => {
    if (sharedUnsubscribe || sharedSubscribing) return;
    sharedSubscribing = true;

    subscribeToForegroundMessages(notifyListeners)
        .then((cleanup) => {
            sharedUnsubscribe = cleanup;
            sharedSubscribing = false;
        })
        .catch((err) => {
            console.error("Failed to subscribe to foreground messages:", err);
            sharedSubscribing = false;
        });
};

const addForegroundListener = (fn) => {
    listeners.add(fn);
    ensureForegroundListener();
    return () => {
        listeners.delete(fn);
        // Don't tear down the shared subscription — keep it alive
    };
};

// ── De-duplication ────────────────────────────────────────────────────
const seenForegroundMessages = new Set();

const rememberForegroundMessage = (id) => {
    if (!id) return false;
    if (seenForegroundMessages.has(id)) return true;

    seenForegroundMessages.add(id);
    if (seenForegroundMessages.size > 100) {
        const oldest = seenForegroundMessages.values().next().value;
        seenForegroundMessages.delete(oldest);
    }

    return false;
};

const getPayloadText = (payload) => {
    const data = payload?.data || {};
    const notification = payload?.notification || {};

    return {
        title: notification.title || data.title || "New Notification",
        body: notification.body || data.body || "You have a new update.",
        route: data.route || "/notifications",
        type: data.type || "System",
        notificationId: data.notificationId,
    };
};

const getNotificationPermissionStatus = () => {
    try {
        return typeof Notification !== "undefined" ? Notification.permission : "default";
    } catch {
        return "default";
    }
};

// ── Hook ──────────────────────────────────────────────────────────────
export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fcmToken, setFcmToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get("/notifications");
            const items = response.data || [];
            setNotifications(items);
            setUnreadCount(items.filter((n) => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [user]);

    // Register FCM token with backend
    const registerToken = useCallback(async (token) => {
        if (!user || !token) return;

        const userId = user._id || user.id;
        if (!userId) return;

        const storageKey = `fcm-token:${userId}`;
        if (localStorage.getItem(storageKey) === token) return;

        try {
            await api.post("/notifications/register-token", {
                token,
                device: navigator.userAgent,
                platform: "web"
            });
            localStorage.setItem(storageKey, token);
            console.log("FCM Token registered with backend");
        } catch (error) {
            console.error("Error registering token with backend:", error);
        }
    }, [user]);

    // Initialize FCM — request permission & get token
    const initFCM = useCallback(async (isManual = false) => {
        if (!user) return;

        try {
            const permission = Notification.permission;
            setPermissionStatus(permission);

            if (permission === "denied") return;

            const shouldRequestPermission = true;
            const token = await requestFirebaseNotificationPermission({
                requestPermission: shouldRequestPermission,
            });

            if (token) {
                setFcmToken(token);
                setPermissionStatus("granted");
                await registerToken(token);
            } else if (Notification.permission === "denied") {
                setPermissionStatus("denied");
            }
        } catch (error) {
            console.error("Error initializing FCM:", error);
        }
    }, [user, registerToken]);

    // On mount: fetch notifications & init FCM
    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        initFCM();
    }, [fetchNotifications, initFCM, user]);

    // Subscribe to foreground messages via the shared listener
    useEffect(() => {
        if (!user || !fcmToken) return;

        const handlePayload = (payload) => {
            const { title, body, route, type, notificationId } = getPayloadText(payload);
            const messageId = notificationId || `${title}:${body}:${route}`;

            // Skip duplicates
            if (rememberForegroundMessage(messageId)) return;

            const newNotification = {
                _id: notificationId || `${Date.now()}`,
                title,
                body,
                type,
                route,
                isRead: false,
                createdAt: new Date().toISOString(),
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            toast.success(title, {
                id: messageId,
                description: body,
                action: {
                    label: "View",
                    onClick: () => {
                        window.location.assign(route);
                    },
                },
            });

            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_APPOINTMENTS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_APPOINTMENTS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
        };

        const removeListener = addForegroundListener(handlePayload);
        return removeListener;
    }, [fcmToken, queryClient, user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all`);
            setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        permissionStatus,
        requestPermission: () => initFCM(true),
        markAsRead,
        markAllAsRead,
        fetchNotifications
    };
};
