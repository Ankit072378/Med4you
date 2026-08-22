import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
    bedNumber: { type: Number, required: true },
    type: {
        type: String,
        enum: ["general", "icu", "emergency", "vip"],
        required: true,
    },
    status: {
        type: String,
        enum: ["available", "occupied", "reserved"],
        default: "available",
    },
    reservationTime: Date,
    expectedReleaseTime: Date,
    notes: String,
    price: {
        type: String,
        required: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        default: null,
    },
    lastUpdated: { type: Date, default: Date.now },
});

const hospitalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { type: String, required: true },
    address: { type: String },
    photo: [{ type: String }],
    city: { type: String, required: true },
    location: {
        lat: Number,
        lng: Number,
    },
    specialities: [{ type: String }],
    beds: [bedSchema],
    doctorIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
    ],
    appointmentIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
    ],
    // Rating calculated using rating Schema
    averageRating: {
        type: Number,
        default: 0,
    },

    ratingCount: {
        type: Number,
        default: 0,
    },
    
    contacts: {
        phone: [String],
        email: [String],
        emergency: [String],
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Hospital", hospitalSchema);