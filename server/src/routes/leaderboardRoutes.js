const express = require("express");
const router = express.Router();
const { getCurrentLeaderboard, getHallOfFame } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

// Routes are prefixed with /api/leaderboard in server.js
router.get("/current", getCurrentLeaderboard);
router.get("/hof", protect, getHallOfFame);

module.exports = router;
