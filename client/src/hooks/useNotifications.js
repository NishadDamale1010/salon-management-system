import { useCallback, useEffect, useRef, useState } from "react";
import {
    getNotificationPermissionStatus,
    requestFirebaseNotificationPermission,
    subscribeToForegroundMessages,
} from "../firebase/firebase";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
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
        const [oldest] = seenForegroundMessages;
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

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const listenerId = useRef(Symbol("foreground-listener"));
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fcmToken, setFcmToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
    const knownNotificationIds = useRef(new Set());
    const hasLoadedNotifications = useRef(false);

    const notifyInApp = useCallback((notification) => {
        const title = notification.title || "New Notification";
        const body = notification.body || "You have a new update.";
        const route = notification.route || "/notifications";
        const messageId = notification._id || `${title}:${body}:${route}`;

        if (rememberForegroundMessage(messageId)) return;

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
    }, [queryClient]);

    const fetchNotifications = useCallback(async ({ showNewToasts = false } = {}) => {
        if (!user) return;

        try {
            const response = await api.get("/notifications");
            const items = response.data || [];
            const nextKnownIds = new Set();
            const newUnreadItems = [];

            items.forEach((item) => {
                if (!item?._id) return;
                nextKnownIds.add(item._id);
                if (showNewToasts && hasLoadedNotifications.current && !knownNotificationIds.current.has(item._id) && !item.isRead) {
                    newUnreadItems.push(item);
                }
            });

            knownNotificationIds.current = nextKnownIds;
            hasLoadedNotifications.current = true;
            setNotifications(items);
            setUnreadCount(items.filter((n) => !n.isRead).length);

            newUnreadItems.reverse().forEach(notifyInApp);
        } catch (error) {
            warnDev("Error fetching notifications:", error);
        }
    }, [notifyInApp, user]);

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
                platform: "web",
            });
            localStorage.setItem(storageKey, token);
        } catch (error) {
            warnDev("Error registering FCM token with backend:", error);
        }
    }, [user]);

    const initFCM = useCallback(async (isManual = false) => {
        if (!user) return null;

        const currentPermission = getNotificationPermissionStatus();
        setPermissionStatus(currentPermission);

        if (currentPermission === "unsupported") return null;
        if (currentPermission === "denied") return null;
        if (currentPermission !== "granted" && !isManual) return null;

        const token = await requestFirebaseNotificationPermission();
        setPermissionStatus(getNotificationPermissionStatus());

        if (token) {
            setFcmToken(token);
            await registerToken(token);
        }

        return token;
    }, [registerToken, user]);

    useEffect(() => {
        if (!user) {
            knownNotificationIds.current = new Set();
            hasLoadedNotifications.current = false;
            return;
        }

        fetchNotifications();
        initFCM();

        const intervalId = window.setInterval(() => {
            fetchNotifications({ showNewToasts: true });
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [fetchNotifications, initFCM, user]);

    useEffect(() => {
        if (!user || !fcmToken || foregroundListenerOwner) return;

        let cancelled = false;
        let unsubscribe = () => {};
        foregroundListenerOwner = listenerId.current;

        subscribeToForegroundMessages((payload) => {
            const { title, body, route, type, notificationId } = getPayloadText(payload);

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

            notifyInApp(newNotification);
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
    }, [fcmToken, notifyInApp, user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            warnDev("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            warnDev("Error marking all notifications as read:", error);
        }
    };

    return {
        notifications,
        unreadCount,
        permissionStatus,
        requestPermission: () => initFCM(true),
        markAsRead,
        markAllAsRead,
        fetchNotifications,
    };
};
