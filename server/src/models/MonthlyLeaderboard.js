const mongoose = require("mongoose");

const monthlyLeaderboardSchema = new mongoose.Schema(
    {
        month: {
            type: String,
            required: true,
            // Format: YYYY-MM
        },
        championId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topUsers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                points: {
                    type: Number,
                    required: true,
                },
                rank: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Ensure only one entry per month
monthlyLeaderboardSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyLeaderboard", monthlyLeaderboardSchema);
