const { z } = require("zod");

const createServiceSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty").trim(),
    description: z.string().trim().optional(),
    category: z.string({ required_error: "Category is required" }).min(1, "Category cannot be empty").trim(),
    price: z.number({ required_error: "Price is required" }).min(0, "Price cannot be negative"),
    duration: z.number({ required_error: "Duration is required" }).min(1, "Duration must be at least 1 minute"),
    image: z.string().url("Image must be a valid Cloudinary URL").optional(),
    isActive: z.boolean().optional(),
});

const updateServiceSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").trim().optional(),
    description: z.string().trim().optional(),
    category: z.string().min(1, "Category cannot be empty").trim().optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
    image: z.string().url("Image must be a valid Cloudinary URL").optional(),
    isActive: z.boolean().optional(),
});

module.exports = {
    createServiceSchema,
    updateServiceSchema,
};
