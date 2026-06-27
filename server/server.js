const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Aai Beauty Studio API Running 🚀",
    });
});

const PORT = process.env.PORT || 5000;
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});