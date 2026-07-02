const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "first Name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "last Name is required"],
            trim: true,
        },

        googleId: {
            type: String,
            sparse: true,
            unique: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },

        glowPoints: {
            type: Number,
            default: 0,
        },

        lifetimeGlowPoints: {
            type: Number,
            default: 0,
        },

        membership: {
            type: String,
            enum: ["Bronze", "Silver", "Gold", "Diamond"],
            default: "Bronze",
        },

        avatar: {
            type: String,
            default: "",
        },

        dob: {
            type: Date,
        },

        instagram: {
            type: String,
            default: "",
        },

        adminNotes: {
            type: String,
            default: "",
        },

        isHiddenFromLeaderboard: {
            type: Boolean,
            default: false,
        },

        isFeaturedOnLeaderboard: {
            type: Boolean,
            default: false,
        },

        monthlyGlowPoints: {
            type: Number,
            default: 0,
        },

        isCurrentChampion: {
            type: Boolean,
            default: false,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        pushSubscriptions: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    );
};

userSchema.methods.updateMembership = function () {
    if (this.lifetimeGlowPoints >= 2000) {
        this.membership = "Diamond";
    } else if (this.lifetimeGlowPoints >= 1000) {
        this.membership = "Gold";
    } else if (this.lifetimeGlowPoints >= 500) {
        this.membership = "Silver";
    } else {
        this.membership = "Bronze";
    }
};

module.exports = mongoose.model("User", userSchema);