import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleLogin: (data) => api.post("/auth/google", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
  getLeaderboard: () => api.get("/auth/leaderboard"),
  getMonthlyLeaderboard: () => api.get("/leaderboard/current"),
  getHallOfFame: () => api.get("/leaderboard/hof"),
};

export const serviceService = {
  getAll: () => api.get("/services"),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  createBulkServices: (data) => api.post("/services/bulk", { services: data }),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const appointmentService = {
  book: (data) => api.post("/appointments", data),
  getMyAppointments: () => api.get("/appointments/my-appointments"),
  getAll: () => api.get("/appointments"),
  getOne: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
};

export const rewardService = {
  getAll: () => api.get("/rewards"),
  create: (data) => api.post("/rewards", data),
  update: (id, data) => api.put(`/rewards/${id}`, data),
  delete: (id) => api.delete(`/rewards/${id}`),
  redeem: (id) => api.post(`/rewards/${id}/redeem`),
  getMyRedemptions: () => api.get("/rewards/my-redemptions"),
  getAllRedemptions: () => api.get("/rewards/redemptions"),
  updateRedemptionStatus: (id, data) =>
    api.patch(`/rewards/redemptions/${id}/status`, data),
};

export const notificationService = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  broadcast: (data) => api.post("/notifications/broadcast", data),
};

export const cmsService = {
  getSettings: () => api.get("/cms/settings"),
  updateSettings: (data) => api.put("/cms/settings", data),
  getGallery: () => api.get("/cms/gallery"),
  createGallery: (data) => api.post("/cms/gallery", data),
  updateGallery: (id, data) => api.put(`/cms/gallery/${id}`, data),
  deleteGallery: (id) => api.delete(`/cms/gallery/${id}`),
  getCertificates: () => api.get("/cms/certificates"),
  createCertificate: (data) => api.post("/cms/certificates", data),
  updateCertificate: (id, data) => api.put(`/cms/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/cms/certificates/${id}`),
  getAchievements: () => api.get("/cms/achievements"),
  createAchievement: (data) => api.post("/cms/achievements", data),
  updateAchievement: (id, data) => api.put(`/cms/achievements/${id}`, data),
  deleteAchievement: (id) => api.delete(`/cms/achievements/${id}`),
  getOffers: () => api.get("/cms/offers"),
  createOffer: (data) => api.post("/cms/offers", data),
  updateOffer: (id, data) => api.put(`/cms/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/cms/offers/${id}`),
  getFAQs: () => api.get("/cms/faqs"),
  createFAQ: (data) => api.post("/cms/faqs", data),
  updateFAQ: (id, data) => api.put(`/cms/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/cms/faqs/${id}`),
  getTestimonials: () => api.get("/cms/testimonials"),
  createTestimonial: (data) => api.post("/cms/testimonials", data),
  updateTestimonial: (id, data) => api.put(`/cms/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/cms/testimonials/${id}`),
  getAwards: () => api.get("/cms/awards"),
  createAward: (data) => api.post("/cms/awards", data),
  updateAward: (id, data) => api.put(`/cms/awards/${id}`, data),
  deleteAward: (id) => api.delete(`/cms/awards/${id}`),
};

export const adminService = {
  register: (data) => api.post("/admin/register", data),
  getDashboard: () => api.get("/admin/dashboard"),
  getWidgets: () => api.get("/admin/dashboard/widgets"),
  getAnalytics: () => api.get("/admin/analytics"),
  getCustomers: (params) => api.get("/admin/customers", { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  updateNotes: (id, data) => api.patch(`/admin/customers/${id}/notes`, data),
  manageGlowPoints: (id, data) =>
    api.patch(`/admin/customers/${id}/glow-points`, data),
  getLeaderboard: () => api.get("/admin/leaderboard"),
  updateLeaderboardVisibility: (id, data) =>
    api.patch(`/admin/customers/${id}/leaderboard`, data),
  resetLeaderboard: () => api.post("/admin/leaderboard/reset"),
};

export const inventoryService = {
  getProducts: (params) => api.get("/inventory", { params }),
  createProduct: (data) => api.post("/inventory", data),
  createBulkProducts: (data) => api.post("/inventory/bulk", { products: data }),
  updateProduct: (id, data) => api.put(`/inventory/${id}`, data),
  logTransaction: (id, data) => api.post(`/inventory/${id}/transaction`, data),
  getHistory: (id) => api.get(`/inventory/${id}/history`),
};

export const activityService = {
  getAll: () => api.get("/activities"),
};

export const paymentService = {
  createCheckout: (appointmentId) =>
    api.post(`/payments/create-checkout-session/${appointmentId}`),
};

export const aiService = {
  chat: async (messages) => {
    const res = await api.post("/ai/chat", { messages });
    return res.data;
  },
  parseProducts: async (rawText) => {
    return await api.post("/ai/parse-products", { rawText });
  },
  parseServices: async (rawText) => {
    return await api.post("/ai/parse-services", { rawText });
  },
};

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },
};

export const orderService = {
  create: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/my-orders"),
  getAllOrders: () => api.get("/orders"),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const journeyService = {
  getMyJourney: () => api.get("/journey/me"),
};

export const glowFeedService = {
  getPosts: (params) => api.get("/feed", { params }),
  createPost: (data) => api.post("/feed", data),
  toggleLike: (id) => api.post(`/feed/${id}/like`),
  getComments: (id) => api.get(`/feed/${id}/comments`),
  createComment: (id, data) => api.post(`/feed/${id}/comments`, data),
  deletePost: (id) => api.delete(`/feed/${id}`),
  getTrending: () => api.get("/feed/trending"),
  getModerationQueue: () => api.get("/feed/admin/moderation"),
  moderatePost: (id, data) => api.patch(`/feed/admin/moderation/${id}`, data),
};

export const reviewService = {
  create: (data) => api.post("/reviews", data),
  getPublicReviews: () => api.get("/reviews/public"),
  getMyReviews: () => api.get("/reviews/my-reviews"),
};

export const visitorService = {
  track: (data) => api.post("/visitors/track", data),
  trackEvent: (data) => api.post("/visitors/event", data),
  updateTimeSpent: (data) => api.post("/visitors/time-spent", data),
  getAnalytics: (params) => api.get("/visitors/analytics", { params }),
  getVisitorsList: (params) => api.get("/visitors/list", { params }),
  getVisitorDetails: (id) => api.get(`/visitors/${id}`),
  getRegistrationFunnel: () => api.get("/visitors/funnel/registration"),
};
