const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            required: [true, "Category is required"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        size: {
            type: String,
            trim: true,
            default: "",
        },
        keyIngredients: {
            type: [String],
            default: [],
        },
        benefits: {
            type: [String],
            default: [],
        },
        imageUrl: {
            type: String,
            trim: true,
            default: "",
        },
        stockQuantity: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
        unit: {
            type: String,
            required: [true, "Unit is required (e.g., ml, bottles, tubes)"],
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
