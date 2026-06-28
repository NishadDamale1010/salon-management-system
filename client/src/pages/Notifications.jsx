import React, { useEffect, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationCard from "../components/ui/NotificationCard";
import { Bell, CheckAll, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Notifications = () => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        permissionStatus, 
        requestPermission,
        fetchNotifications
    } = useNotifications();
    
    const navigate = useNavigate();

    // To implement real infinite scroll, we would need pagination backend support.
    // For now, we simulate by showing all fetched or a large limit.
    const [visibleCount, setVisibleCount] = useState(20);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 20);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 pt-20">
            <div className="max-w-3xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Notifications
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-all border border-blue-500/20"
                            >
                                <CheckAll className="w-4 h-4" />
                                Mark all as read
                            </button>
                        )}
                        {/* Settings Button could link to notification preferences */}
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors bg-white/5 border border-white/10">
                            <Settings className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Permission Banner */}
                {permissionStatus === "default" && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-blue-100">Never miss an update</h3>
                            <p className="text-sm text-blue-200 mt-1">Get instant alerts for your appointments, rewards, and exclusive offers.</p>
                        </div>
                        <button 
                            onClick={requestPermission}
                            className="w-full md:w-auto whitespace-nowrap px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                        >
                            Enable Push Notifications
                        </button>
                    </motion.div>
                )}

                {/* List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-300 mb-2">All caught up!</h3>
                            <p className="text-gray-500">You don't have any notifications right now.</p>
                        </div>
                    ) : (
                        <>
                            {notifications.slice(0, visibleCount).map((notif, i) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <NotificationCard 
                                        notification={notif} 
                                        onMarkAsRead={markAsRead}
                                        onClick={(n) => n.route && navigate(n.route)}
                                    />
                                </motion.div>
                            ))}

                            {visibleCount < notifications.length && (
                                <div className="pt-6 text-center">
                                    <button 
                                        onClick={handleLoadMore}
                                        className="px-6 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Notifications;
