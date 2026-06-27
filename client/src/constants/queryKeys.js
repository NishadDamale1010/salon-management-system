export const QUERY_KEYS = {
  // Auth
  ME: ["auth", "me"],

  // Public CMS
  SETTINGS: ["cms", "settings"],
  GALLERY: ["cms", "gallery"],
  CERTIFICATES: ["cms", "certificates"],
  ACHIEVEMENTS: ["cms", "achievements"],
  OFFERS: ["cms", "offers"],
  FAQS: ["cms", "faqs"],
  TESTIMONIALS: ["cms", "testimonials"],

  // Services
  SERVICES: ["services"],
  SERVICE: (id) => ["services", id],

  // Appointments
  MY_APPOINTMENTS: ["appointments", "my"],
  ALL_APPOINTMENTS: ["appointments", "all"],
  APPOINTMENT: (id) => ["appointments", id],

  // Rewards
  REWARDS: ["rewards"],
  MY_REDEMPTIONS: ["rewards", "redemptions", "my"],
  ALL_REDEMPTIONS: ["rewards", "redemptions", "all"],

  // Notifications
  NOTIFICATIONS: ["notifications"],

  // Leaderboard
  LEADERBOARD: ["leaderboard"],

  // Products
  PRODUCTS: ["products"],

  // Admin
  DASHBOARD_STATS: ["admin", "dashboard"],
  DASHBOARD_WIDGETS: ["admin", "widgets"],
  ANALYTICS: ["admin", "analytics"],
  CUSTOMERS: ["admin", "customers"],
  CUSTOMER: (id) => ["admin", "customers", id],
  ACTIVITIES: ["admin", "activities"],
  INVENTORY: ["admin", "inventory"],
  PRODUCT_HISTORY: (id) => ["admin", "inventory", id, "history"],

  // Admin CMS management (all items)
  ADMIN_GALLERY: ["admin", "cms", "gallery"],
  ADMIN_TESTIMONIALS: ["admin", "cms", "testimonials"],
};
