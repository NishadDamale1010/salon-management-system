import React, { useState } from "react";
import { Bell, Check, Settings, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationCard from "./NotificationCard";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBell = () => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        permissionStatus, 
        requestPermission 
    } = useNotifications();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification._id);
        if (notification.route) navigate(notification.route);
        setOpen(false);
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none">
                    <Bell className="w-6 h-6 text-gray-200" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-500 rounded-full border-2 border-gray-900"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content 
                    className="z-50 w-80 md:w-96 rounded-2xl p-0 bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden" 
                    sideOffset={10} 
                    align="end"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={() => markAllAsRead()}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" /> Mark all read
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setOpen(false); navigate("/notifications"); }}
                                    className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <Popover.Close asChild>
                                    <button className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </Popover.Close>
                            </div>
                        </div>

                        {/* Permission Warning */}
                        {permissionStatus === "default" && (
                            <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex flex-col gap-2">
                                <p className="text-sm text-blue-200">Enable push notifications to never miss an update!</p>
                                <button 
                                    onClick={requestPermission}
                                    className="text-xs bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors font-medium self-start"
                                >
                                    Enable Notifications
                                </button>
                            </div>
                        )}
                        {permissionStatus === "denied" && (
                            <div className="p-3 bg-red-500/10 border-b border-red-500/20">
                                <p className="text-xs text-red-200">Notifications are blocked by your browser. Please enable them in settings.</p>
                            </div>
                        )}

                        {/* Body */}
                        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>You have no notifications</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {notifications.slice(0, 10).map((notif) => (
                                        <NotificationCard 
                                            key={notif._id} 
                                            notification={notif} 
                                            onMarkAsRead={markAsRead}
                                            onClick={handleNotificationClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-2 border-t border-white/10 bg-black/40">
                                <button 
                                    onClick={() => { setOpen(false); navigate("/notifications"); }}
                                    className="w-full py-2 text-sm text-center text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-lg transition-colors font-medium"
                                >
                                    View All Notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default NotificationBell;
