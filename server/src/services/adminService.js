const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const Reward = require("../models/Reward");
const RewardRedemption = require("../models/RewardRedemption");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const AppError = require("../utils/AppError");
const {
    registerAdminSchema,
    updateNotesSchema,
    manageGlowPointsSchema,
    leaderboardSettingsSchema,
} = require("../validations/adminValidation");
const jwt = require("jsonwebtoken");

const registerAdmin = async (adminData) => {
    const validationResult = registerAdminSchema.safeParse(adminData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    const { adminSecret, firstName, lastName, email, phone, password } = validationResult.data;

    if (adminSecret !== process.env.ADMIN_SECRET) {
        throw new AppError("Unauthorized: Invalid Admin Secret", 401);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        throw new AppError("User with this email or phone already exists", 400);
    }

    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: "admin",
        isVerified: true,
    });

    return admin;
};

const getDashboardStats = async () => {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });

    // Appointments stats
    const appointmentsAggregation = await Appointment.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    let pendingAppointments = 0,
        confirmedAppointments = 0,
        completedAppointments = 0,
        cancelledAppointments = 0;
    let totalAppointments = 0;

    appointmentsAggregation.forEach((stat) => {
        totalAppointments += stat.count;
        if (stat._id === "Pending") pendingAppointments = stat.count;
        if (stat._id === "Confirmed") confirmedAppointments = stat.count;
        if (stat._id === "Completed") completedAppointments = stat.count;
        if (stat._id === "Cancelled") cancelledAppointments = stat.count;
    });

    // Revenue & Glow Points stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const revenueAggregation = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                todayRevenue: {
                    $sum: {
                        $cond: [{ $gte: ["$createdAt", today] }, "$totalAmount", 0],
                    },
                },
                monthlyRevenue: {
                    $sum: {
                        $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalAmount", 0],
                    },
                },
                yearlyRevenue: {
                    $sum: {
                        $cond: [{ $gte: ["$createdAt", startOfYear] }, "$totalAmount", 0],
                    },
                },
                todayAppointments: {
                    $sum: {
                        $cond: [{ $gte: ["$createdAt", today] }, 1, 0],
                    },
                },
            },
        },
    ]);

    const revenueData = revenueAggregation[0] || {
        totalRevenue: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        todayAppointments: 0,
    };

    const averageAppointmentValue = completedAppointments > 0 ? revenueData.totalRevenue / completedAppointments : 0;

    // Glow points issued
    const glowPointsAggregation = await LoyaltyTransaction.aggregate([
        { $match: { type: "Earned" } },
        {
            $group: {
                _id: null,
                totalIssued: { $sum: "$points" },
            },
        },
    ]);
    const totalGlowPointsIssued = glowPointsAggregation[0] ? glowPointsAggregation[0].totalIssued : 0;

    // Repeat customers
    const repeatCustomersAggregation = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: "$customer", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: "repeatCustomers" },
    ]);
    const repeatCustomers = repeatCustomersAggregation[0] ? repeatCustomersAggregation[0].repeatCustomers : 0;

    return {
        totalCustomers,
        totalAdmins,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalServices,
        activeServices,
        totalGlowPointsIssued,
        monthlyRevenue: revenueData.monthlyRevenue,
        yearlyRevenue: revenueData.yearlyRevenue,
        totalRevenue: revenueData.totalRevenue,
        todayAppointments: revenueData.todayAppointments,
        todayRevenue: revenueData.todayRevenue,
        averageAppointmentValue: Math.round(averageAppointmentValue),
        repeatCustomers,
    };
};

const getCustomers = async (query) => {
    const { search, membership, sort, page = 1, limit = 10 } = query;

    const filter = { role: "customer" };

    if (membership) filter.membership = membership;
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ];
    }

    let mongooseQuery = User.find(filter).select("-password");

    if (sort) {
        mongooseQuery = mongooseQuery.sort(sort.split(",").join(" "));
    } else {
        mongooseQuery = mongooseQuery.sort("-createdAt");
    }

    const skip = (page - 1) * limit;
    mongooseQuery = mongooseQuery.skip(skip).limit(Number(limit));

    const customers = await mongooseQuery;
    const total = await User.countDocuments(filter);

    return {
        customers,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

const getCustomerDetails = async (id) => {
    const customer = await User.findOne({ _id: id, role: "customer" }).select("-password");
    if (!customer) throw new AppError("Customer not found", 404);

    const appointments = await Appointment.find({ customer: id }).sort("-createdAt").populate("services.service", "name");
    const rewardHistory = await RewardRedemption.find({ user: id }).sort("-redeemedAt").populate("reward", "title");
    const glowPointHistory = await LoyaltyTransaction.find({ user: id }).sort("-createdAt");

    return {
        customer,
        appointments,
        rewardHistory,
        glowPointHistory,
    };
};

const updateCustomerNotes = async (id, notesData) => {
    const validationResult = updateNotesSchema.safeParse(notesData);
    if (!validationResult.success) {
        throw new AppError("Invalid notes data", 400);
    }

    const customer = await User.findOneAndUpdate(
        { _id: id, role: "customer" },
        { adminNotes: validationResult.data.adminNotes },
        { returnDocument: 'after' }
    ).select("-password");

    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
};

const manageGlowPoints = async (id, pointData) => {
    const validationResult = manageGlowPointsSchema.safeParse(pointData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    const { action, points, reason } = validationResult.data;
    const customer = await User.findOne({ _id: id, role: "customer" });
    if (!customer) throw new AppError("Customer not found", 404);

    if (action === "add") {
        customer.glowPoints += points;
        customer.lifetimeGlowPoints += points;
        customer.monthlyGlowPoints += points;
        
        await LoyaltyTransaction.create({
            user: customer._id,
            points,
            type: "Earned",
            reason: `Admin Add: ${reason}`,
        });

        customer.updateMembership();
    } else if (action === "deduct") {
        if (customer.glowPoints < points) {
            throw new AppError("Cannot deduct more points than customer currently has", 400);
        }
        customer.glowPoints -= points;

        await LoyaltyTransaction.create({
            user: customer._id,
            points,
            type: "Redeemed",
            reason: `Admin Deduct: ${reason}`,
        });
        // Deducting does not reduce lifetime or monthly points
    }

    await customer.save();
    return customer;
};

const getAnalytics = async () => {
    // 1. Top Customers by Revenue
    const topCustomers = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        {
            $group: {
                _id: "$customer",
                totalSpent: { $sum: "$totalAmount" },
                appointmentsCount: { $sum: 1 },
            },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customerData",
            },
        },
        { $unwind: "$customerData" },
        {
            $project: {
                _id: 1,
                totalSpent: 1,
                appointmentsCount: 1,
                firstName: "$customerData.firstName",
                lastName: "$customerData.lastName",
                email: "$customerData.email",
                phone: "$customerData.phone",
            },
        },
    ]);

    // 2. Most Popular Services
    const popularServices = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        { $unwind: "$services" },
        {
            $group: {
                _id: "$services.service",
                serviceName: { $first: "$services.serviceName" },
                timesBooked: { $sum: 1 },
                revenueGenerated: { $sum: "$services.price" },
            },
        },
        { $sort: { timesBooked: -1 } },
        { $limit: 10 },
    ]);

    // 3. New Customers this Month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newCustomersThisMonth = await User.countDocuments({
        role: "customer",
        createdAt: { $gte: startOfMonth },
    });

    // 4. Reward Redemption Count
    const rewardRedemptionCount = await RewardRedemption.countDocuments({ status: "Success" });

    return {
        topCustomers,
        popularServices,
        newCustomersThisMonth,
        rewardRedemptionCount,
    };
};

const getLeaderboard = async () => {
    const monthly = await User.find({ role: "customer", isHiddenFromLeaderboard: false })
        .select("firstName lastName avatar monthlyGlowPoints membership isFeaturedOnLeaderboard")
        .sort("-monthlyGlowPoints")
        .limit(20);

    const lifetime = await User.find({ role: "customer", isHiddenFromLeaderboard: false })
        .select("firstName lastName avatar lifetimeGlowPoints membership isFeaturedOnLeaderboard")
        .sort("-lifetimeGlowPoints")
        .limit(20);

    return { monthly, lifetime };
};

const manageLeaderboardVisibility = async (id, settingsData) => {
    const validationResult = leaderboardSettingsSchema.safeParse(settingsData);
    if (!validationResult.success) {
        throw new AppError("Invalid leaderboard settings data", 400);
    }

    const customer = await User.findOneAndUpdate(
        { _id: id, role: "customer" },
        validationResult.data,
        { returnDocument: 'after' }
    ).select("-password");

    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
};

const resetMonthlyLeaderboard = async () => {
    const result = await User.updateMany({ role: "customer" }, { monthlyGlowPoints: 0 });
    return { success: true, message: `Reset monthly glow points for ${result.modifiedCount} customers.` };
};

const getDashboardWidgets = async () => {
    const newestCustomers = await User.find({ role: "customer" }).sort("-createdAt").limit(5).select("firstName lastName email createdAt avatar");
    const latestAppointments = await Appointment.find().sort("-createdAt").limit(5).populate("customer", "firstName lastName");
    const topGlowMembers = await User.find({ role: "customer", isHiddenFromLeaderboard: false }).sort("-lifetimeGlowPoints").limit(5).select("firstName lastName membership lifetimeGlowPoints");
    const recentRedemptions = await RewardRedemption.find().sort("-createdAt").limit(5).populate("user", "firstName lastName").populate("reward", "title");
    
    // Revenue metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const revenueAggregation = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        {
            $group: {
                _id: null,
                todayRevenue: {
                    $sum: { $cond: [{ $gte: ["$createdAt", today] }, "$totalAmount", 0] },
                },
                monthlyRevenue: {
                    $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalAmount", 0] },
                },
            },
        },
    ]);

    const revenueData = revenueAggregation[0] || { todayRevenue: 0, monthlyRevenue: 0 };

    // Popular Services
    const popularServices = await Appointment.aggregate([
        { $match: { status: "Completed" } },
        { $unwind: "$services" },
        {
            $group: {
                _id: "$services.service",
                serviceName: { $first: "$services.serviceName" },
                timesBooked: { $sum: 1 },
            },
        },
        { $sort: { timesBooked: -1 } },
        { $limit: 5 },
    ]);

    // Upcoming birthdays (next 30 days logic is complex in mongo, let's just do month matching)
    const currentMonth = today.getMonth() + 1; // 1-12
    const upcomingBirthdays = await User.aggregate([
        { $match: { role: "customer", dob: { $exists: true, $ne: null } } },
        {
            $project: {
                firstName: 1,
                lastName: 1,
                dob: 1,
                month: { $month: "$dob" },
            }
        },
        { $match: { month: currentMonth } },
        { $limit: 5 }
    ]);

    return {
        newestCustomers,
        latestAppointments,
        topGlowMembers,
        recentRedemptions,
        popularServices,
        todayRevenue: revenueData.todayRevenue,
        monthlyRevenue: revenueData.monthlyRevenue,
        upcomingBirthdays,
    };
};

module.exports = {
    registerAdmin,
    getDashboardStats,
    getCustomers,
    getCustomerDetails,
    updateCustomerNotes,
    manageGlowPoints,
    getAnalytics,
    getLeaderboard,
    manageLeaderboardVisibility,
    resetMonthlyLeaderboard,
    getDashboardWidgets,
};
