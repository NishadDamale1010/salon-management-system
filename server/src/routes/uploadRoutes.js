const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/cloudinary");
const { uploadImage } = require("../controllers/uploadController");

// Protected upload route (Logged in users)
router.use(protect);

// Expecting form-data with field name "image"
router.post("/", upload.single("image"), uploadImage);

module.exports = router;
