import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    institution: { type: String, required: true },
    smallAbout: String,
    startYear: String,
    endYear: String,
});

const scheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

const doctorSchema = new mongoose.Schema({
    // Basic Profile
    name: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    age: {
        type: String,
        required: true,
    },
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    // Type of doctor (main specialization)
    type: { type: String, required: true }, // example: "Cardiologist"

    // Experience + Fee
    experience: { type: Number, required: true }, // years
    fee: { type: Number, required: true },

    // Availability Today (updated daily)
    availableToday: { type: Boolean, default: false },
    currentStatus: {
        type: String,
        enum: ["available", "busy", "not_available", "not_arrived", "on_break"],
        default: "not_available",
    },

    // Rating — calculated dynamically through Rating Schema
    averageRating: {
        type: Number,
        default: 0,
    },

    ratingCount: {
        type: Number,
        default: 0,
    },
    // Contacts
    contact: {
        phone: String,
        email: String,
        whatsapp: String,
    },

    // About Section
    about: String,
    city: String,
    address: String,

    // Languages doctor can speak
    languages: [String], // ["Hindi", "English", "Marathi"]

    // Qualifications (strings only)
    qualifications: [String], // ["MBBS", "MD", "DM Cardiology"]

    // Education Timeline (full detail)
    educationTimeline: [educationSchema],

    // Specializations (multiple areas)
    specializations: [String], // ["Heart Failure", "Cardiac Imaging"]

    // Hospitals Doctor Works In
    hospitals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
    ],

    // Weekly schedule
    schedule: [scheduleSchema],

    profilePhoto: String,

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Doctor", doctorSchema);
