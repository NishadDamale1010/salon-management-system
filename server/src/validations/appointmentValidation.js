const { z } = require("zod");

const createAppointmentSchema = z.object({
    serviceIds: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID"))
        .optional()
        .default([]),
    customServices: z
        .array(z.string().trim().min(2, "Custom service must be at least 2 characters").max(200, "Custom service cannot exceed 200 characters"))
        .optional()
        .default([]),
    appointmentDate: z.coerce.date({
        required_error: "Appointment date is required",
        invalid_type_error: "Invalid date format",
    }),
    appointmentTime: z.string({ required_error: "Appointment time is required" }).min(1, "Appointment time cannot be empty"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    paymentMethod: z.enum(["Cash", "Manual UPI", "Razorpay", "Stripe"]).optional(),
    transactionId: z.string().optional(),
    paymentScreenshot: z.string().optional(),
}).refine(
    (data) => data.serviceIds.length > 0 || data.customServices.length > 0,
    { message: "Select at least one service or add a custom service request" }
);

const updateAppointmentStatusSchema = z.object({
    status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled", "Payment Failed"]).optional(),
    paymentStatus: z.enum(["Unpaid", "Verification Pending", "Pending", "Paid", "Rejected"]).optional(),
    paymentMethod: z.enum(["Cash", "Manual UPI", "Razorpay", "Stripe", "UPI", "Card"]).optional(),
    suggestedTimeFrame: z.string().optional(),
    transactionId: z.string().optional(),
    paymentScreenshot: z.string().optional(),
});

module.exports = {
    createAppointmentSchema,
    updateAppointmentStatusSchema,
};
