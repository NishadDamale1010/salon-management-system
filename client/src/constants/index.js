export const SALON_NAME = "Gayatri Beauty Studio";
export const SALON_TAGLINE = "Your Beauty, Our Passion";
export const SALON_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "918830383499";
export const SALON_INSTAGRAM = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/bharti_damale?igsh=YzljYTk1ODg3Zg==";
export const SALON_FACEBOOK = import.meta.env.VITE_FACEBOOK_URL || "#";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const MEMBERSHIP_TIERS = {
  Bronze: { color: "#cd7f32", min: 0, max: 999 },
  Silver: { color: "#a8a9ad", min: 1000, max: 4999 },
  Gold: { color: "#fbbf24", min: 5000, max: 14999 },
  Platinum: { color: "#e5e4e2", min: 15000, max: Infinity },
};

export const GALLERY_CATEGORIES = [
  "Facial", "Hair", "Hair Color", "Hair Spa",
  "Waxing", "Threading", "Bridal", "Nails", "Skin", "Other",
];

export const ACHIEVEMENT_CATEGORIES = [
  "Award", "Achievement", "Certificate", "Trophy", "Milestone", "Media",
];

export const APPOINTMENT_STATUSES = {
  Pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  Confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  Completed: { label: "Completed", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  Cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
};

export const NOTIFICATION_TYPES = {
  Appointment: { icon: "Calendar", color: "text-rose-400" },
  Reward: { icon: "Gift", color: "text-purple-400" },
  "Glow Points": { icon: "Sparkles", color: "text-yellow-400" },
  Offer: { icon: "Tag", color: "text-emerald-400" },
  Birthday: { icon: "Cake", color: "text-pink-400" },
  System: { icon: "Bell", color: "text-blue-400" },
};

export const CURRENCY = "₹";

export const GLOW_POINTS_RATE = 100; // 1 point per ₹100
