import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        profilePhoto: { type: String },
        age: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "other"],
            default:"Male"
        },
        bloodGroup: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        emergencyContacts: [
            {
                name: String,
                phone: String,
                relation: String,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);