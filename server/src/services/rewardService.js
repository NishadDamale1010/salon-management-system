const Reward = require("../models/Reward");
const RewardRedemption = require("../models/RewardRedemption");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { createRewardSchema, updateRewardSchema } = require("../validations/rewardValidation");

const createReward = async (rewardData) => {
    const validationResult = createRewardSchema.safeParse(rewardData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    const reward = await Reward.create(validationResult.data);
    return reward;
};

const updateReward = async (id, updateData) => {
    const validationResult = updateRewardSchema.safeParse(updateData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    const reward = await Reward.findByIdAndUpdate(id, validationResult.data, {
        returnDocument: 'after',
        runValidators: true,
    });

    if (!reward) {
        throw new AppError("Reward not found", 404);
    }

    return reward;
};

const deleteReward = async (id) => {
    // Soft delete
    const reward = await Reward.findByIdAndUpdate(
        id,
        { isActive: false },
        { returnDocument: 'after' }
    );

    if (!reward) {
        throw new AppError("Reward not found", 404);
    }

    return reward;
};

const getActiveRewards = async () => {
    const rewards = await Reward.find({ isActive: true }).sort("glowPointsRequired");
    return rewards;
};

const redeemReward = async (userId, rewardId) => {
    // 1. Check user membership (Fresh fetch to be safe)
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.membership === "Bronze") {
        throw new AppError("Upgrade to Silver Membership to redeem Glow Rewards.", 403);
    }

    // 2. Check reward exists and active
    const reward = await Reward.findOne({ _id: rewardId, isActive: true });
    if (!reward) {
        throw new AppError("Reward not found or is no longer active", 404);
    }

    // 3. Check customer has enough Glow Points
    if (user.glowPoints < reward.glowPointsRequired) {
        throw new AppError("Not enough Glow Points to redeem this reward", 400);
    }

    // 4. Subtract Current Glow Points (Lifetime remains unchanged)
    user.glowPoints -= reward.glowPointsRequired;
    await user.save();

    // 5. Create Loyalty Transaction for the subtraction
    await LoyaltyTransaction.create({
        user: user._id,
        points: reward.glowPointsRequired,
        type: "Redeemed",
        reason: "Reward Redemption",
    });

    // 6. Create Reward Redemption history
    const redemption = await RewardRedemption.create({
        user: user._id,
        reward: reward._id,
        glowPointsSpent: reward.glowPointsRequired,
        discountAmount: reward.discountAmount,
        status: "Pending",
    });

    return redemption;
};

const getMyRedemptionHistory = async (userId) => {
    const history = await RewardRedemption.find({ user: userId })
        .populate("reward")
        .sort("-redeemedAt");
    return history;
};

const getAllRedemptions = async () => {
    const redemptions = await RewardRedemption.find()
        .populate("user")
        .populate("reward")
        .sort("-redeemedAt");
    return redemptions;
};

const updateRedemptionStatus = async (id, statusData) => {
    const { status } = statusData;
    if (!["Pending", "Success", "Rejected"].includes(status)) {
        throw new AppError("Invalid redemption status", 400);
    }

    const redemption = await RewardRedemption.findById(id);
    if (!redemption) {
        throw new AppError("Redemption not found", 404);
    }

    // Refund points if rejected
    if (redemption.status === "Pending" && status === "Rejected") {
        const user = await User.findById(redemption.user);
        if (user) {
            user.glowPoints += redemption.glowPointsSpent;
            await user.save();

            // Log refund transaction
            await LoyaltyTransaction.create({
                user: user._id,
                points: redemption.glowPointsSpent,
                type: "Refunded",
                reason: "Refund for rejected reward redemption",
            });
        }
    }

    redemption.status = status;
    await redemption.save();

    return await RewardRedemption.findById(id).populate("user").populate("reward");
};

module.exports = {
    createReward,
    updateReward,
    deleteReward,
    getActiveRewards,
    redeemReward,
    getMyRedemptionHistory,
    getAllRedemptions,
    updateRedemptionStatus,
};
