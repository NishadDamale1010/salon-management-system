const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
    protect,
} = require("../middleware/authMiddleware");

router.post(
    "/register",
    authController.register
);

router.post(
    "/login",
    authController.login
);

router.post(
    "/google",
    authController.googleLogin
);

router.post(
    "/logout",
    authController.logout
);

router.get(
    "/me",
    protect,
    authController.getMe
);

router.put(
    "/me",
    protect,
    authController.updateMe
);

router.get(
    "/leaderboard",
    protect,
    authController.getLeaderboard
);

module.exports = router;