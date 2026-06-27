const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

const { cloudinary, allowedImageMimeTypes } = require("../utils/cloudinary");

exports.uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return sendResponse(res, 400, false, "Please upload a supported image file (JPG, PNG, WebP, or GIF) up to 5MB.", null);
    }

    if (!allowedImageMimeTypes.has(req.file.mimetype)) {
        return sendResponse(res, 400, false, "Unsupported image format. Use JPG, PNG, WebP, or GIF.", null);
    }

    try {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "salon-uploads" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return next(error);
                }
                sendResponse(res, 200, true, "Image uploaded successfully", { url: result.secure_url });
            }
        );
        stream.end(req.file.buffer);
    } catch (err) {
        console.error("Upload stream error:", err);
        next(err);
    }
});
