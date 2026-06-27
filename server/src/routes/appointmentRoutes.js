const express = require("express");
const router = express.Router();

const {
    bookAppointment,
    getCustomerAppointments,
    getSingleAppointment,
    getAllAppointments,
    updateAppointmentStatus,
    deleteAppointment,
} = require("../controllers/appointmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All appointment routes require authentication
router.use(protect);

// Customer API routes
router.post("/", bookAppointment);
router.get("/my-appointments", getCustomerAppointments);
router.get("/:id", getSingleAppointment); // Also accessible by Admin

// Admin API routes
router.get("/", authorize("admin"), getAllAppointments);
router.patch("/:id/status", authorize("admin"), updateAppointmentStatus);
router.delete("/:id", authorize("admin"), deleteAppointment);

module.exports = router;
