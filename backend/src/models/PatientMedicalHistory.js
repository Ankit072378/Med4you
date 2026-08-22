import mongoose from "mongoose";

const patientMedicalHistorySchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            unique: true,
        },

        // Chronic Conditions
        chronicConditions: [
            {
                condition: String,
                diagnosedDate: Date,
                managementPlan: String,
                status: {
                    type: String,
                    enum: ["active", "managed", "resolved"],
                    default: "active",
                },
            },
        ],

        // Allergies
        allergies: [
            {
                allergen: String,
                type: {
                    type: String,
                    enum: ["drug", "food", "environmental", "other"],
                },
                severity: {
                    type: String,
                    enum: ["mild", "moderate", "severe", "life_threatening"],
                },
                reaction: String,
                diagnosedDate: Date,
            },
        ],

        // Current Medications
        currentMedications: [
            {
                medication: String,
                dosage: String,
                frequency: String,
                startDate: Date,
                prescribedBy: String,
                reason: String,
            },
        ],

        // Past Surgeries
        surgeries: [
            {
                procedure: String,
                date: Date,
                hospital: String,
                surgeon: String,
                notes: String,
            },
        ],

        // Immunizations
        immunizations: [
            {
                vaccine: String,
                date: Date,
                nextDueDate: Date,
                batchNumber: String,
                administeredBy: String,
            },
        ],

        // Family History
        familyHistory: [
            {
                relation: String,
                condition: String,
                ageOfOnset: Number,
            },
        ],

        // Social History
        socialHistory: {
            smokingStatus: {
                type: String,
                enum: ["never", "former", "current", "unknown"],
            },
            alcoholConsumption: {
                type: String,
                enum: ["none", "occasional", "moderate", "heavy", "unknown"],
            },
            occupation: String,
            exerciseFrequency: String,
        },

        // Emergency Contacts
        emergencyContacts: [
            {
                name: String,
                relationship: String,
                phone: String,
                isPrimary: Boolean,
            },
        ],

        // Blood Type
        bloodType: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },

        // Privacy Settings
        privacySettings: {
            allowDataSharing: { type: Boolean, default: false },
            allowResearchUse: { type: Boolean, default: false },
        },

        // Summary Statistics
        statistics: {
            totalVisits: { type: Number, default: 0 },
            lastVisitDate: Date,
            totalPrescriptions: { type: Number, default: 0 },
            totalLabTests: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "PatientMedicalHistory",
    patientMedicalHistorySchema
);