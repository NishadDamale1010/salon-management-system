const Service = require("../models/Service");
const AppError = require("../utils/AppError");
const { createServiceSchema, updateServiceSchema } = require("../validations/serviceValidation");

const createService = async (serviceData) => {
    // Validate request data
    const validationResult = createServiceSchema.safeParse(serviceData);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    // Check for unique service name
    const existingService = await Service.findOne({ name: validationResult.data.name });
    if (existingService) {
        throw new AppError("Service with this name already exists", 400);
    }

    // Create service
    const service = await Service.create(validationResult.data);
    return service;
};

const updateService = async (id, serviceData) => {
    // Validate request data
    const validationResult = updateServiceSchema.safeParse(serviceData);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        throw new AppError(errors, 400);
    }

    // If updating the name, ensure it remains unique
    if (validationResult.data.name) {
        const existingService = await Service.findOne({
            name: validationResult.data.name,
            _id: { $ne: id }
        });
        if (existingService) {
            throw new AppError("Service with this name already exists", 400);
        }
    }

    // Update service
    const service = await Service.findByIdAndUpdate(
        id,
        validationResult.data,
        { new: true, runValidators: true }
    );

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    return service;
};

const deleteService = async (id) => {
    // Soft delete by setting isActive to false
    const service = await Service.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    return service;
};

const getAllServices = async (query) => {
    const { category, search, sort } = query;
    const filter = { isActive: true };

    // Filter by category
    if (category) {
        filter.category = category;
    }

    // Filter by search term in name
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    let mongooseQuery = Service.find(filter);

    // Apply sorting
    if (sort) {
        const sortBy = sort.split(",").join(" ");
        mongooseQuery = mongooseQuery.sort(sortBy);
    } else {
        mongooseQuery = mongooseQuery.sort("-createdAt");
    }

    const services = await mongooseQuery;
    return services;
};

const getSingleService = async (id) => {
    const service = await Service.findOne({ _id: id, isActive: true });
    
    if (!service) {
        throw new AppError("Service not found", 404);
    }
    
    return service;
};

module.exports = {
    createService,
    updateService,
    deleteService,
    getAllServices,
    getSingleService
};
