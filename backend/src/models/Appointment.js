import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        tokenNumber: {
            type: Number,
            required: true,
        },
        // Status
        status: {
            type: String,
            enum: [
                "scheduled",
                "in_queue",
                "in_consultation",
                "completed",
                "cancelled",
                "no_show",
            ],
            default: "scheduled",
        },

        // Queue Management
        queuePosition: {
            type: Number,
            default: null,
        },
        estimatedWaitTime: {
            type: Number,
            default: null,
        },
        actualArrivalTime: {
            type: Date,
            default: null,
        },
        consultationStartTime: {
            type: Date,
            default: null,
        },
        consultationEndTime: {
            type: Date,
            default: null,
        },

        // Appointment Details
        reason: {
            type: String,
            required: true,
        },
        symptoms: [String],

        // Payment
        consultationFee: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi", "insurance"],
            default: null,
        },
        transactionId: {
            type: String,
            default: null,
        },

        // Medical Records (After Consultation)
        diagnosis: {
            type: String,
            default: null,
        },
        prescription: {
            type: String,
            default: null,
        },
        testsRecommended: [String],
        followUpDate: {
            type: Date,
            default: null,
        },
        medicalDocuments: [String],

        // Notes
        patientNotes: {
            type: String,
            default: null,
        },
        doctorNotes: {
            type: String,
            default: null,
        },

        // Cancellation
        cancellationReason: {
            type: String,
            default: null,
        },
        cancelledBy: {
            type: String,
            enum: ["patient", "doctor", "hospital"],
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ hospitalId: 1, appointmentDate: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;