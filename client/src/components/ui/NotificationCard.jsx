import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Calendar, Gift, Star, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn"; // assuming they have a cn utility, or I can just use template literals if not

// Fallback utility if cn is not available
const clsx = (...classes) => classes.filter(Boolean).join(" ");

const getIconForType = (type) => {
    switch (type) {
        case "Appointment": return <Calendar className="w-5 h-5 text-blue-500" />;
        case "Payment Verified": return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "Reward":
        case "Glow Points": return <Star className="w-5 h-5 text-yellow-500" />;
        case "Offer": return <Gift className="w-5 h-5 text-pink-500" />;
        case "System":
        default: return <Bell className="w-5 h-5 text-purple-500" />;
    }
};

const NotificationCard = ({ notification, onClick, onMarkAsRead }) => {
    const { _id, title, body, type, isRead, createdAt, image } = notification;

    const handleClick = () => {
        if (!isRead && onMarkAsRead) {
            onMarkAsRead(_id);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={clsx(
                "relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300",
                "hover:bg-white/10 backdrop-blur-md border border-white/5",
                isRead ? "opacity-75" : "bg-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            )}
        >
            {/* Unread Indicator */}
            {!isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}

            {/* Icon / Image */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    getIconForType(type)
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <p className={clsx(
                    "text-sm font-semibold truncate",
                    isRead ? "text-gray-400" : "text-gray-100"
                )}>
                    {title}
                </p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {body}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;
