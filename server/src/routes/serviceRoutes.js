const express = require("express");
const router = express.Router();

const {
    createService,
    updateService,
    deleteService,
    getAllServices,
    getSingleService,
} = require("../controllers/serviceController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public API routes
router.get("/", getAllServices);
router.get("/:id", getSingleService);

// Admin API routes
router.use(protect);
router.use(authorize("admin"));

router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
