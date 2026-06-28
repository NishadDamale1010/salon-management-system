const inventoryService = require("../services/inventoryService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

exports.getProducts = asyncHandler(async (req, res) => {
    const data = await inventoryService.getProducts(req.query);
    sendResponse(res, 200, true, "Products retrieved successfully", data);
});

const Product = require("../models/Product");

exports.createProduct = asyncHandler(async (req, res) => {
    const data = await inventoryService.createProduct(req.body);
    sendResponse(res, 201, true, "Product created successfully", data);
});

// @desc    Create bulk products
// @route   POST /api/inventory/bulk
// @access  Private/Admin
exports.createBulkProducts = asyncHandler(async (req, res, next) => {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        return sendResponse(res, 400, false, "Please provide an array of products.", null);
    }

    try {
        const createdProducts = await Product.insertMany(products, { ordered: false });
        sendResponse(res, 201, true, `${createdProducts.length} products created successfully.`, createdProducts);
    } catch (err) {
        // If some inserts fail due to unique constraints, ordered: false will still insert the rest
        if (err.name === 'BulkWriteError') {
            const insertedCount = err.result.nInserted;
            return sendResponse(res, 207, true, `${insertedCount} products created. Some failed (likely duplicate SKUs).`, null);
        }
        next(err);
    }
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const data = await inventoryService.updateProduct(req.params.id, req.body);
    sendResponse(res, 200, true, "Product updated successfully", data);
});

exports.logTransaction = asyncHandler(async (req, res) => {
    const data = await inventoryService.logTransaction(req.params.id, req.body);
    sendResponse(res, 201, true, "Stock transaction logged", data);
});

exports.getProductHistory = asyncHandler(async (req, res) => {
    const data = await inventoryService.getProductHistory(req.params.id);
    sendResponse(res, 200, true, "Product history retrieved", data);
});
