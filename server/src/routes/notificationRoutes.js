const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    registerToken,
    removeToken,
    broadcastNotification
} = require("../controllers/notificationController");
const { authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/register-token", registerToken);
router.delete("/remove-token", removeToken);
router.post("/broadcast", authorize("admin"), broadcastNotification);

router.get("/", getUserNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
