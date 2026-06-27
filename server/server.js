const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const rewardRoutes = require("./src/routes/rewardRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const cmsRoutes = require("./src/routes/cmsRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const aiRoutes = require("./src/routes/aiRoutes");

dotenv.config();

const app = express();

connectDB();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Webhook needs raw body, must be mounted before express.json()
app.use("/api/payments", paymentRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/ai", aiRoutes);
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Gayatri Beauty Studio API Running 🚀",
    });
});

const PORT = process.env.PORT || 5000;
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});