const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    api_key: process.env.CLOUDINARY_API_KEY || "demo_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "demo_secret",
});

const storage = multer.memoryStorage();
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        cb(null, allowedImageMimeTypes.has(file.mimetype));
    },
});

module.exports = {
    cloudinary,
    upload,
    allowedImageMimeTypes,
};
