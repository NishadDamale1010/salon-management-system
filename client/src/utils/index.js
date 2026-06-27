import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (time) => time || "—";

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const getMembershipColor = (membership) => {
  const colors = {
    Bronze: "#cd7f32",
    Silver: "#a8a9ad",
    Gold: "#fbbf24",
    Platinum: "#e5e4e2",
  };
  return colors[membership] || colors.Bronze;
};

export const getMembershipGradient = (membership) => {
  const gradients = {
    Bronze: "from-amber-700 to-amber-900",
    Silver: "from-slate-400 to-slate-600",
    Gold: "from-yellow-400 to-yellow-600",
    Platinum: "from-slate-200 to-slate-400",
  };
  return gradients[membership] || gradients.Bronze;
};

export const getInitials = (firstName, lastName) =>
  `${(firstName || "?")[0]}${(lastName || "")[0] || ""}`.toUpperCase();

export const truncate = (str, n = 80) =>
  str && str.length > n ? `${str.slice(0, n)}...` : str;

export const glowPointsFromAmount = (amount) =>
  Math.floor((amount || 0) / 100);

export * from "./pushNotifications";
