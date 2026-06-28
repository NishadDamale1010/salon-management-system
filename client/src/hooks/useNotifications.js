import { useState, useEffect, useCallback, useRef } from "react";
import { requestFirebaseNotificationPermission, subscribeToForegroundMessages } from "../firebase/firebase";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner"; // Assuming sonner is used for toasts (from package.json)
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants/queryKeys";

const isDev = import.meta.env.DEV;
const warnDev = (...args) => {
    if (isDev) console.warn(...args);
};

let foregroundListenerOwner = null;
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

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fcmToken, setFcmToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
    const listenerId = useRef(`listener-${Date.now()}`);

    // Fetch initial notifications
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

    // Register Token with backend
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

    // Initialize FCM
    const initFCM = useCallback(async (isManual = false) => {
        if (!user) return;
        
        // On mobile, requestPermission on load is often blocked.
        // We only auto-init if already granted, OR if the user manually clicked a button.
        if (Notification.permission === "granted" || isManual) {
            const token = await requestFirebaseNotificationPermission();
            if (token) {
                setFcmToken(token);
                setPermissionStatus("granted");
                await registerToken(token);
            } else if (Notification.permission === "denied") {
                setPermissionStatus("denied");
            }
        } else if (Notification.permission === "denied") {
            setPermissionStatus("denied");
        }
    }, [user, registerToken]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();
        initFCM();
    }, [fetchNotifications, initFCM, user]);

    useEffect(() => {
        if (!user || !fcmToken || foregroundListenerOwner) return;

        let cancelled = false;
        let unsubscribe = () => {};
        foregroundListenerOwner = listenerId.current;

        subscribeToForegroundMessages((payload) => {
            const { title, body, route, type, notificationId } = getPayloadText(payload);
            const messageId = notificationId || `${title}:${body}:${route}`;

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
        }).then((cleanup) => {
            if (cancelled) {
                cleanup();
                return;
            }
            unsubscribe = cleanup;
        });

        return () => {
            cancelled = true;
            unsubscribe();
            if (foregroundListenerOwner === listenerId.current) {
                foregroundListenerOwner = null;
            }
        };
    }, [fcmToken, queryClient, user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all`);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        permissionStatus,
        requestPermission: () => initFCM(true), // Expose to let users manually request
        markAsRead,
        markAllAsRead,
        fetchNotifications
    };
};
