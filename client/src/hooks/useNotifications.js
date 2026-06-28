import { useState, useEffect } from "react";
import { requestFirebaseNotificationPermission, onMessageListener } from "../firebase/firebase";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner"; // Assuming sonner is used for toasts (from package.json)
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fcmToken, setFcmToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

    // Fetch initial notifications
    const fetchNotifications = async () => {
        try {
            const data = await api.get("/notifications");
            setNotifications(data.data);
            setUnreadCount(data.data.filter((n) => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    // Register Token with backend
    const registerToken = async (token) => {
        try {
            await api.post("/notifications/register-token", { 
                token, 
                device: navigator.userAgent, 
                platform: "web" 
            });
            console.log("FCM Token registered with backend");
        } catch (error) {
            console.error("Error registering token with backend:", error);
        }
    };

    // Initialize FCM
    const initFCM = async (isManual = false) => {
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
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            initFCM();
        }
    }, [user]);

    // Listen for foreground messages
    useEffect(() => {
        if (user && fcmToken) {
            const listen = async () => {
                const payload = await onMessageListener();
                if (payload) {
                    console.log("Foreground message received:", payload);
                    
                    const newNotification = {
                        _id: payload.data.notificationId || Date.now().toString(),
                        title: payload.notification.title,
                        body: payload.notification.body,
                        type: payload.data.type || "System",
                        route: payload.data.route || "/",
                        isRead: false,
                        createdAt: new Date().toISOString(),
                    };
                    
                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                    
                    toast.success(payload.notification.title, {
                        description: payload.notification.body,
                        action: {
                            label: "View",
                            onClick: () => {
                                if (payload.data.route) window.location.href = payload.data.route;
                            }
                        }
                    });

                    // Invalidate queries so that dashboards and lists auto-refresh
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });

                    // Re-listen
                    listen();
                }
            };
            listen();
        }
    }, [user, fcmToken]);

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
