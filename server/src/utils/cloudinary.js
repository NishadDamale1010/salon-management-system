const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
    api_key: process.env.CLOUDINARY_API_KEY || "demo_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "demo_secret",
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload,
};
