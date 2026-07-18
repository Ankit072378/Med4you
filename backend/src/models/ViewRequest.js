// models/ViewRequest.js
import mongoose from "mongoose";

const viewRequestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    familyUserId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    approvedAt: Date,
}, { timestamps: true });

export default mongoose.model("ViewRequest", viewRequestSchema);