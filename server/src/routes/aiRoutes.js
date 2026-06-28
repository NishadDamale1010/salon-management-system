const express = require("express");
const router = express.Router();
const { getAIChatResponse, parseBulkProducts } = require("../controllers/aiController");

router.post("/chat", getAIChatResponse);
router.post("/parse-products", parseBulkProducts);

module.exports = router;
