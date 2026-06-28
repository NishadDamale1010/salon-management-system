const express = require("express");
const router = express.Router();
const { getAIChatResponse, parseBulkProducts, parseBulkServices } = require("../controllers/aiController");

router.post("/chat", getAIChatResponse);
router.post("/parse-products", parseBulkProducts);
router.post("/parse-services", parseBulkServices);

module.exports = router;
