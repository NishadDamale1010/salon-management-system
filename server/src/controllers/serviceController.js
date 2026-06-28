const serviceService = require("../services/serviceService");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

const createService = asyncHandler(async (req, res) => {
    const service = await serviceService.createService(req.body);
    sendResponse(res, 201, true, "Service created successfully", service);
});

const createBulkServices = asyncHandler(async (req, res) => {
    const { services } = req.body;
    const result = await serviceService.createBulkServices(services);
    
    if (result.errorCount > 0 && result.successCount === 0) {
        return sendResponse(res, 400, false, "Failed to create services", result);
    }
    
    sendResponse(res, 201, true, `Created ${result.successCount} services successfully`, result);
});

const updateService = asyncHandler(async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body);
    sendResponse(res, 200, true, "Service updated successfully", service);
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await serviceService.deleteService(req.params.id);
    sendResponse(res, 200, true, "Service deleted successfully", service);
});

const getAllServices = asyncHandler(async (req, res) => {
    const services = await serviceService.getAllServices(req.query);
    sendResponse(res, 200, true, "Services retrieved successfully", services);
});

const getSingleService = asyncHandler(async (req, res) => {
    const service = await serviceService.getSingleService(req.params.id);
    sendResponse(res, 200, true, "Service retrieved successfully", service);
});

module.exports = {
    createService,
    createBulkServices,
    updateService,
    deleteService,
    getAllServices,
    getSingleService
};
