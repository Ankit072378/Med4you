import mongoose from "mongoose";

const medicalAccessRequestSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },

        // Requester Info
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        requesterType: {
            type: String,
            enum: ["doctor", "hospital"],
            required: true,
        },

        // Request Details
        purpose: {
            type: String,
            required: true,
        },
        requestedData: {
            fullHistory: { type: Boolean, default: true },
            dateRange: {
                from: Date,
                to: Date,
            },
            specificRecords: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MedicalRecord",
                },
            ],
        },

        // Access Level
        accessLevel: {
            type: String,
            enum: ["read_only", "read_write"],
            default: "read_only",
        },

        // Status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "expired", "revoked"],
            default: "pending",
        },

        // Approval Details
        respondedAt: Date,
        rejectionReason: String,

        // Access Duration
        accessGrantedAt: Date,
        accessExpiresAt: Date,

        // Usage tracking
        lastAccessedAt: Date,
        accessCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Indexes
medicalAccessRequestSchema.index({ patientId: 1, status: 1 });
medicalAccessRequestSchema.index({ requesterId: 1, requesterType: 1 });

export default mongoose.model(
    "MedicalAccessRequest",
    medicalAccessRequestSchema
);