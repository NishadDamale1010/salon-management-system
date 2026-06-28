const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        device: {
            type: String,
            default: "Unknown",
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        platform: {
            type: String,
            enum: ["web", "android", "ios", "desktop", "unknown"],
            default: "web",
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for fast lookups
fcmTokenSchema.index({ user: 1, token: 1 });

module.exports = mongoose.model("FCMToken", fcmTokenSchema);
