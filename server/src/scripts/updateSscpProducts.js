require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
let sscpProducts = require("../data/sscpProducts");

const updateSscpProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        for (const product of sscpProducts) {
            // Fix benefits if it's an array
            if (Array.isArray(product.benefits)) {
                product.benefits = product.benefits.join(", ");
            }
            await Product.updateOne(
                { sku: product.sku },
                { $set: product },
                { upsert: true }
            );
        }

        console.log("Successfully updated SSCP products with new images and details.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating SSCP products:", error);
        process.exit(1);
    }
};

updateSscpProducts();
