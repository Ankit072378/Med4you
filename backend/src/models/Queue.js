import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        // Doctor & Hospital
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

        // Date
        date: {
            type: Date,
            required: true,
            default: () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return today;
            },
        },

        // Queue Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Doctor Status
        doctorStatus: {
            type: String,
            enum: ["not_arrived", "available", "busy", "on_break", "completed"],
            default: "not_arrived",
        },

        // Current Patient Being Served
        currentPatient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
        },
        currentTokenNumber: {
            type: Number,
            default: 0,
        },

        // Queue Statistics
        totalPatients: {
            type: Number,
            default: 0,
        },
        completedPatients: {
            type: Number,
            default: 0,
        },
        waitingPatients: {
            type: Number,
            default: 0,
        },

        // Timing
        queueStartTime: {
            type: Date,
            default: null,
        },
        queueEndTime: {
            type: Date,
            default: null,
        },

        // Average consultation time (in minutes)
        averageConsultationTime: {
            type: Number,
            default: 15,
        },

        // Break Management
        breaks: [
            {
                startTime: Date,
                endTime: Date,
                reason: String,
            },
        ],

        // Appointments in Queue (ordered list)
        appointments: [
            {
                appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Appointment",
                },
                tokenNumber: Number,
                status: {
                    type: String,
                    enum: [
                        "waiting",
                        "called",
                        "in_consultation",
                        "completed",
                        "skipped",
                    ],
                    default: "waiting",
                },
                joinedAt: Date,
                calledAt: Date,
                completedAt: Date,
            },
        ],

        // Last Token Number Issued
        lastTokenNumber: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // This automatically handles createdAt and updatedAt
    }
);

// Ensure one queue per doctor per day
queueSchema.index({ doctorId: 1, date: 1 }, { unique: true });

// NO PRE-SAVE HOOK NEEDED - timestamps option handles it

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;
