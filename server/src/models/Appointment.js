const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        services: [
            {
                service: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                },
                serviceName: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                duration: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                isCustom: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        totalDuration: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled", "Payment Failed"],
            default: "Pending",
        },
        suggestedTimeFrame: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Unpaid", "Verification Pending", "Pending", "Paid", "Rejected"],
            default: "Pending",
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "Manual UPI", "Razorpay", "Stripe", "Card", "UPI"],
        },
        transactionId: {
            type: String,
        },
        paymentScreenshot: {
            type: String,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        verifiedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
