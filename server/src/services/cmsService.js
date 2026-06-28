const Gallery = require("../models/Gallery");
const Certificate = require("../models/Certificate");
const Achievement = require("../models/Achievement");
const Setting = require("../models/Setting");
const Testimonial = require("../models/Testimonial");
const Offer = require("../models/Offer");
const FAQ = require("../models/FAQ");
const AppError = require("../utils/AppError");

const {
    gallerySchema,
    certificateSchema,
    achievementSchema,
    settingSchema,
    testimonialSchema,
    offerSchema,
    faqSchema,
} = require("../validations/cmsValidation");

// --- GALLERY ---
exports.getGallery = async () => Gallery.find({ isActive: true }).sort("-createdAt");
exports.createGallery = async (data) => {
    const validated = gallerySchema.parse(data);
    return Gallery.create(validated);
};
exports.updateGallery = async (id, data) => {
    const validated = gallerySchema.partial().parse(data);
    return Gallery.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteGallery = async (id) => Gallery.findByIdAndDelete(id);

// --- CERTIFICATES ---
exports.getCertificates = async () => Certificate.find({ isActive: true }).sort("-issueDate");
exports.createCertificate = async (data) => {
    const validated = certificateSchema.parse(data);
    return Certificate.create(validated);
};
exports.updateCertificate = async (id, data) => {
    const validated = certificateSchema.partial().parse(data);
    return Certificate.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteCertificate = async (id) => Certificate.findByIdAndDelete(id);

// --- ACHIEVEMENTS ---
exports.getAchievements = async () => Achievement.find().sort("-year");
exports.createAchievement = async (data) => {
    const validated = achievementSchema.parse(data);
    return Achievement.create(validated);
};
exports.updateAchievement = async (id, data) => {
    const validated = achievementSchema.partial().parse(data);
    return Achievement.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteAchievement = async (id) => Achievement.findByIdAndDelete(id);

// --- SETTINGS ---
exports.getSettings = async () => {
    let setting = await Setting.findOne();
    if (!setting) {
        setting = await Setting.create({});
    }
    return setting;
};
exports.updateSettings = async (data) => {
    const validated = settingSchema.partial().parse(data);
    let setting = await Setting.findOne();
    if (!setting) {
        return Setting.create(validated);
    }
    return Setting.findByIdAndUpdate(setting._id, validated, { returnDocument: 'after' });
};

// --- TESTIMONIALS ---
exports.getTestimonials = async () => Testimonial.find({ approved: true }).sort("-createdAt");
exports.createTestimonial = async (data) => {
    const validated = testimonialSchema.parse(data);
    return Testimonial.create(validated); // Requires admin approval
};
exports.updateTestimonial = async (id, data) => {
    const validated = testimonialSchema.partial().parse(data);
    return Testimonial.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteTestimonial = async (id) => Testimonial.findByIdAndDelete(id);

// --- OFFERS ---
exports.getOffers = async () => Offer.find({ active: true, endDate: { $gte: new Date() } }).sort("endDate");
exports.createOffer = async (data) => {
    const validated = offerSchema.parse(data);
    return Offer.create(validated);
};
exports.updateOffer = async (id, data) => {
    const validated = offerSchema.partial().parse(data);
    return Offer.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteOffer = async (id) => Offer.findByIdAndDelete(id);

// --- FAQS ---
exports.getFAQs = async () => FAQ.find({ active: true }).sort("order");
exports.createFAQ = async (data) => {
    const validated = faqSchema.parse(data);
    return FAQ.create(validated);
};
exports.updateFAQ = async (id, data) => {
    const validated = faqSchema.partial().parse(data);
    return FAQ.findByIdAndUpdate(id, validated, { returnDocument: 'after' });
};
exports.deleteFAQ = async (id) => FAQ.findByIdAndDelete(id);
