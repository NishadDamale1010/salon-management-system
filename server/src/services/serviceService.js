const Service = require("../models/Service");
const AppError = require("../utils/AppError");
const { createServiceSchema, updateServiceSchema } = require("../validations/serviceValidation");

const createService = async (serviceData) => {
    // Validate request data
    const validationResult = createServiceSchema.safeParse(serviceData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => err.message).join(", ");
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

const createBulkServices = async (servicesData) => {
    if (!Array.isArray(servicesData) || servicesData.length === 0) {
        throw new AppError("No services provided", 400);
    }

    const createdServices = [];
    const errors = [];

    for (const [index, serviceData] of servicesData.entries()) {
        try {
            const validationResult = createServiceSchema.safeParse(serviceData);
            if (!validationResult.success) {
                errors.push(`Row ${index + 1}: ${validationResult.error.issues.map(e => e.message).join(", ")}`);
                continue;
            }

            const existingService = await Service.findOne({ name: validationResult.data.name });
            if (existingService) {
                // Update existing service
                const updated = await Service.findByIdAndUpdate(
                    existingService._id,
                    validationResult.data,
                    { new: true, runValidators: true }
                );
                createdServices.push(updated);
            } else {
                // Create new
                const created = await Service.create(validationResult.data);
                createdServices.push(created);
            }
        } catch (err) {
            errors.push(`Row ${index + 1}: ${err.message}`);
        }
    }

    return {
        successCount: createdServices.length,
        errorCount: errors.length,
        errors,
        services: createdServices
    };
};

const updateService = async (id, serviceData) => {
    // Validate request data
    const validationResult = updateServiceSchema.safeParse(serviceData);
    if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => err.message).join(", ");
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
        { returnDocument: 'after', runValidators: true }
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
        { returnDocument: 'after' }
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
    createBulkServices,
    updateService,
    deleteService,
    getAllServices,
    getSingleService
};
