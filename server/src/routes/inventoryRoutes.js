const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getProducts,
    createProduct,
    updateProduct,
    logTransaction,
    getProductHistory,
} = require("../controllers/inventoryController");

// Logged-in users can view the product catalog; stock changes stay admin-only.
router.use(protect);
router.get("/", getProducts);

router.use(authorize("admin"));
router.post("/", createProduct);
router.put("/:id", updateProduct);

router.post("/:id/transaction", logTransaction);
router.get("/:id/history", getProductHistory);

module.exports = router;
