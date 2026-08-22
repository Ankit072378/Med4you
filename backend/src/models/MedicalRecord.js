import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: String,
});

const vitalSignsSchema = new mongoose.Schema({
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    spo2: Number,
    respiratoryRate: Number,
    bmi: Number,
});

const labTestSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    testDate: Date,
    result: String,
    normalRange: String,
    attachments: [String],
});

const diagnosisSchema = new mongoose.Schema({
    condition: { type: String, required: true },
    severity: {
        type: String,
        enum: ["mild", "moderate", "severe", "critical"],
    },
    diagnosedDate: Date,
    status: {
        type: String,
        enum: ["active", "resolved", "chronic", "in_remission"],
        default: "active",
    },
    notes: String,
});

const medicalRecordSchema = new mongoose.Schema(
    {
        // Patient Info
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true,
        },

        // Visit/Consultation Info
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        visitDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        visitType: {
            type: String,
            enum: [
                "consultation",
                "follow_up",
                "emergency",
                "routine_checkup",
                "procedure",
                "surgery",
                "diagnostic",
            ],
            default: "consultation",
        },

        // Provider Info (Optional hospital)
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
            index: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            index: true,
        },

        // Clinical Information
        chiefComplaint: String,
        symptoms: [String],
        diagnosis: [diagnosisSchema],
        vitalSigns: vitalSignsSchema,

        // Examination & Findings
        physicalExamination: String,
        clinicalNotes: String,

        // Treatment
        prescriptions: [prescriptionSchema],
        procedures: [
            {
                name: String,
                date: Date,
                performedBy: String,
                notes: String,
            },
        ],
        labTests: [labTestSchema],

        // Follow-up & Referrals
        followUp: {
            required: { type: Boolean, default: false },
            date: Date,
            instructions: String,
        },
        referrals: [
            {
                speciality: String,
                doctorName: String,
                reason: String,
                date: Date,
            },
        ],

        // Attachments
        attachments: [
            {
                type: {
                    type: String,
                    enum: [
                        "prescription",
                        "lab_report",
                        "xray",
                        "scan",
                        "document",
                        "image",
                    ],
                },
                url: String,
                name: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // Status
        status: {
            type: String,
            enum: ["draft", "completed", "amended", "deleted"],
            default: "completed",
        },

        // Metadata
        recordNumber: {
            type: String,
            unique: true,
        },
        createdBy: {
            userId: mongoose.Schema.Types.ObjectId,
            userType: {
                type: String,
                enum: ["doctor", "hospital"],
            },
            name: String,
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique record number
medicalRecordSchema.pre("save", async function (next) {
    if (!this.recordNumber) {
        const count = await mongoose.model("MedicalRecord").countDocuments();
        this.recordNumber = `MR${Date.now()}${String(count + 1).padStart(
            4,
            "0"
        )}`;
    }
});

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });
medicalRecordSchema.index({ hospitalId: 1, visitDate: -1 });
medicalRecordSchema.index({ recordNumber: 1 });

export default mongoose.model("MedicalRecord", medicalRecordSchema);