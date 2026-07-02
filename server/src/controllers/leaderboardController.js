const User = require("../models/User");
const MonthlyLeaderboard = require("../models/MonthlyLeaderboard");

exports.getCurrentLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({
            role: "customer",
            isHiddenFromLeaderboard: false,
        })
            .sort({ monthlyGlowPoints: -1 })
            .limit(50)
            .select("firstName lastName avatar monthlyGlowPoints isCurrentChampion isFeaturedOnLeaderboard");

        res.status(200).json({
            success: true,
            data: topUsers,
        });
    } catch (error) {
        console.error("Error in getCurrentLeaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard",
        });
    }
};

exports.getHallOfFame = async (req, res) => {
    try {
        const hallOfFame = await MonthlyLeaderboard.find()
            .sort({ month: -1 })
            .populate("championId", "firstName lastName avatar")
            .populate("topUsers.user", "firstName lastName avatar");

        res.status(200).json({
            success: true,
            data: hallOfFame,
        });
    } catch (error) {
        console.error("Error in getHallOfFame:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch hall of fame",
        });
    }
};
