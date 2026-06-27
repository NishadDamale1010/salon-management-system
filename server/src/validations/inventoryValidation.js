const { z } = require("zod");

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    brand: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    size: z.string().optional(),
    keyIngredients: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    unit: z.string().min(1, "Unit is required"),
    lowStockThreshold: z.number().int().min(0).optional(),
});

const transactionSchema = z.object({
    type: z.enum(["Restock", "Usage"]),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    reason: z.string().optional(),
});

module.exports = {
    productSchema,
    transactionSchema,
};
