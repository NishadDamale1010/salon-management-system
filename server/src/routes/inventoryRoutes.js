const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getProducts,
    createProduct,
    updateProduct,
    logTransaction,
    getProductHistory,
    createBulkProducts,
} = require("../controllers/inventoryController");

// Public route to view product catalog
router.get("/", getProducts);

router.use(protect);

router.use(authorize("admin"));
router.post("/", createProduct);
router.post("/bulk", createBulkProducts);
router.put("/:id", updateProduct);

router.post("/:id/transaction", logTransaction);
router.get("/:id/history", getProductHistory);

module.exports = router;
