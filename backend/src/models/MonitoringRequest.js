import mongoose from "mongoose";

const monitoringRequestSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "expired", "completed"],
            default: "pending",
        },
        callId: {
            type: String,
            default: null,
        },
        streamToken: {
            type: String,
            default: null,
        },
        startTime: {
            type: Date,
            default: null,
        },
        endTime: {
            type: Date,
            default: null,
        },
        duration: {
            type: Number,
            default: 5, // 5 minutes
        },
        reason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Index for efficient queries
monitoringRequestSchema.index({ hospitalId: 1, status: 1 });
monitoringRequestSchema.index({ requestedBy: 1, status: 1 });

export default mongoose.model("MonitoringRequest", monitoringRequestSchema);
