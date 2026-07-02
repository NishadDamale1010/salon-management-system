const cron = require("node-cron");
const User = require("../models/User");
const MonthlyLeaderboard = require("../models/MonthlyLeaderboard");

const runMonthlyReset = async () => {
    console.log("🏆 Starting Monthly Leaderboard Reset...");
    try {
        // 1. Get Top Users
        const topUsers = await User.find({ role: "customer", isHiddenFromLeaderboard: false })
            .sort({ monthlyGlowPoints: -1 })
            .limit(50)
            .select("_id monthlyGlowPoints isCurrentChampion");

        if (topUsers.length === 0) {
            console.log("No users found for leaderboard reset.");
            return;
        }

        const championId = topUsers[0]._id;
        
        // Formulate leaderboard entries
        const leaderboardEntries = topUsers.map((u, index) => ({
            user: u._id,
            points: u.monthlyGlowPoints,
            rank: index + 1
        }));

        // Determine previous month string (YYYY-MM)
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const prevMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        // 2. Save snapshot
        await MonthlyLeaderboard.create({
            month: prevMonth,
            championId: championId,
            topUsers: leaderboardEntries
        });

        console.log(`Snapshot for ${prevMonth} created successfully.`);

        // 3. Reset all monthlyGlowPoints and update isCurrentChampion
        await User.updateMany({}, { $set: { monthlyGlowPoints: 0, isCurrentChampion: false } });
        
        // Set the new champion
        await User.updateOne({ _id: championId }, { $set: { isCurrentChampion: true } });

        console.log("Monthly reset completed successfully.");
    } catch (error) {
        // If unique index on month throws an error, it means it already ran
        if (error.code === 11000) {
            console.log("Monthly reset already ran for this month.");
        } else {
            console.error("Error during monthly reset:", error);
        }
    }
};

const startMonthlyScheduler = () => {
    // Run at 00:00 on the 1st of every month
    cron.schedule("0 0 1 * *", async () => {
        await runMonthlyReset();
    });
    console.log("📅 Monthly reset scheduler initialized");
};

module.exports = { startMonthlyScheduler, runMonthlyReset };
