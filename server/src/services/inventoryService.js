const Product = require("../models/Product");
const sscpProducts = require("../data/sscpProducts");
const StockTransaction = require("../models/StockTransaction");
const AppError = require("../utils/AppError");
const notificationService = require("./notificationService");
const User = require("../models/User"); // To find admin to notify if needed
const { productSchema, transactionSchema } = require("../validations/inventoryValidation");

const ensureSscpProducts = async () => {
    await Promise.all(sscpProducts.map(product =>
        Product.updateOne(
            { sku: product.sku },
            { $setOnInsert: product },
            { upsert: true }
        )
    ));
};

exports.getProducts = async () => {
    await ensureSscpProducts();
    return Product.find().sort("name");
};

exports.createProduct = async (data) => {
    const validated = productSchema.parse(data);
    const exists = await Product.findOne({ sku: validated.sku });
    if (exists) throw new AppError("Product with this SKU already exists", 400);
    return Product.create(validated);
};

exports.updateProduct = async (id, data) => {
    const validated = productSchema.partial().parse(data);
    const product = await Product.findByIdAndUpdate(id, validated, { new: true });
    if (!product) throw new AppError("Product not found", 404);
    return product;
};

exports.logTransaction = async (productId, data) => {
    const validated = transactionSchema.parse(data);
    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    if (validated.type === "Usage" && product.stockQuantity < validated.quantity) {
        throw new AppError("Insufficient stock for this usage", 400);
    }

    // Apply stock changes
    if (validated.type === "Restock") {
        product.stockQuantity += validated.quantity;
    } else if (validated.type === "Usage") {
        product.stockQuantity -= validated.quantity;
    }

    await product.save();

    const transaction = await StockTransaction.create({
        product: product._id,
        ...validated,
    });

    // Alert if stock drops below threshold
    if (product.stockQuantity <= product.lowStockThreshold) {
        // Send a system notification to the first admin (or you could send it to all admins)
        const admin = await User.findOne({ role: "admin" });
        if (admin) {
            await notificationService.createNotification(
                admin._id,
                "System",
                "Low Stock Alert \u26A0\uFE0F",
                `The product ${product.name} (SKU: ${product.sku}) is running low on stock. Current quantity: ${product.stockQuantity} ${product.unit}.`
            );
        }
    }

    return { product, transaction };
};

exports.getProductHistory = async (productId) => {
    return StockTransaction.find({ product: productId }).sort("-createdAt");
};
