const express = require("express");
const router = express.Router();
const { subscribe, unsubscribe } = require("../controllers/pushController");
const { protect } = require("../middleware/authMiddleware");

// All push routes require authentication
router.use(protect);

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

module.exports = router;
