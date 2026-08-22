import mongoose, { trusted } from "mongoose";

const emergencyNotificationSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        patientPhone: {
            type: String,
            required:true,
        },
        patientName: { type: String, required: true },
        location: {
            type: String,
            required: true
        }, // "lat,long" or GeoJSON string
        bloodGroup: String,
        age: String,
        status: {
            type: String,
            enum: ["pending", "resolved", "read"],
            default: "pending",
        },
        emergencyContactPhones: [
            {
                phone: String,
                name: String,
                read: { type: Boolean, default: false },
            },
        ],
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model(
    "EmergencyNotification",
    emergencyNotificationSchema
);