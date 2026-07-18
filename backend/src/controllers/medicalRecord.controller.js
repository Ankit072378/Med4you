import MedicalRecord from "../models/MedicalRecord.js";
import PatientMedicalHistory from "../models/PatientMedicalHistory.js";
import MedicalAccessRequest from "../models/MedicalAccessRequest.js";
import Patient from "../models/Patient.js";

// Create medical record (Doctor/Hospital)
export const createMedicalRecord = async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            visitType,
            chiefComplaint,
            symptoms,
            diagnosis,
            vitalSigns,
            physicalExamination,
            clinicalNotes,
            prescriptions,
            procedures,
            labTests,
            followUp,
            attachments,
        } = req.body;

        let doctorId = null;
        let hospitalId = null;

        // DOCTOR creating a medical record
        if (req.user.role === "doctor") {
            if (!req.doctor) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor profile not found",
                });
            }

            doctorId = req.doctor._id; // Doctor's profile ID

            if (req.body.hospitalId) {
                // Verify this hospital is in doctor's hospitals array
                if (req.doctor.hospitals.some(h => h._id.toString() === req.body.hospitalId)) {
                    hospitalId = req.body.hospitalId;
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "You are not associated with this hospital",
                    });
                }
            } else if (req.doctor.hospitals && req.doctor.hospitals.length > 0) {
                // Default to first hospital if not specified
                hospitalId = req.doctor.hospitals[0]._id;
            }
        }

        // HOSPITAL creating a medical record
        else if (req.user.role === "hospital") {
            if (!req.hospital) {
                return res.status(404).json({
                    success: false,
                    message: "Hospital profile not found",
                });
            }

            hospitalId = req.hospital._id; // Hospital's profile ID

            // Hospital MUST specify which doctor (from their doctorIds array)
            if (!req.body.doctorId) {
                return res.status(400).json({
                    success: false,
                    message: "Doctor ID is required when hospital creates a record",
                });
            }

            // Verify this doctor is associated with this hospital
            if (req.hospital.doctorIds.some(d => d._id.toString() === req.body.doctorId)) {
                doctorId = req.body.doctorId;
            } else {
                return res.status(403).json({
                    success: false,
                    message: "This doctor is not associated with your hospital",
                });
            }
        }

        // Validate that we have both doctorId and hospitalId
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID is required",
            });
        }

        const medicalRecord = new MedicalRecord({
            patientId,
            appointmentId,
            visitDate: new Date(),
            visitType,
            doctorId, // Doctor's profile _id
            hospitalId, // Hospital's profile _id (can be null for independent doctors)
            chiefComplaint,
            symptoms,
            diagnosis,
            vitalSigns,
            physicalExamination,
            clinicalNotes,
            prescriptions,
            procedures,
            labTests,
            followUp,
            attachments,
            createdBy: {
                userId: req.user._id,
                userType: req.user.role,
            },
            status: "completed",
        });

        await medicalRecord.save();

        // Update patient medical history summary
        await updatePatientHistorySummary(patientId);

        // Populate doctor and hospital details before sending response
        await medicalRecord.populate([
            { path: "doctorId", select: "name type experience profilePhoto" },
            { path: "hospitalId", select: "name city address" },
        ]);

        res.status(201).json({
            success: true,
            message: "Medical record created successfully",
            data: medicalRecord,
        });
    } catch (error) {
        console.error("Error creating medical record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create medical record",
            error: error.message,
        });
    }
};


// Get patient's complete medical history (Patient view)
export const getPatientMedicalHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        console.log(
            `patientId:${patientId.toString()},userId:${req.user.id.toString()}`
        );

        // Verify patient access
        if (req.user.role === "patient") {
            const patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found",
                });
            }
            if (patient.userId.toString() !== req.user.id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }
        }

        // Verify provider access
        if (req.user.role !== "patient") {
            const access = await MedicalAccessRequest.findOne({
                patientId,
                requesterId: req.user.id,
                requesterType: req.user.role,
                status: "approved",
                accessExpiresAt: { $gt: new Date() },
            });

            if (!access) {
                return res.status(403).json({
                    success: false,
                    message: "Access not approved by patient",
                });
            }
        }

        // Fetch medical records (doctor-created)
        const records = await MedicalRecord.find({ patientId })
            .populate("doctorId", "name type profilePhoto")
            .populate("hospitalId", "name city")
            .sort({ visitDate: -1 });

        // Fetch patient's self-reported medical history
        const patientMedicalHistory = await PatientMedicalHistory.findOne({
            patientId,
        });

        res.status(200).json({
            success: true,
            data: {
                records, // Doctor-created medical records
                patientMedicalHistory, // Patient's self-reported history
            },
        });
    } catch (error) {
        console.error("Error fetching medical history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch medical history",
            error: error.message,
        });
    }
};

// Get patient's medical history for approved providers (doctors/hospitals)
export const getPatientMedicalHistoryForProvider = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify provider has approved access
        const access = await MedicalAccessRequest.findOne({
            patientId,
            requesterId: req.user.id,
            requesterType: req.user.role,
            status: "approved",
            accessExpiresAt: { $gt: new Date() },
        });

        if (!access) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this patient's medical history. Please request access first.",
            });
        }

        // Fetch patient's self-reported medical history
        const patientMedicalHistory = await PatientMedicalHistory.findOne({
            patientId,
        });

        if (!patientMedicalHistory) {
            return res.status(404).json({
                success: false,
                message: "Patient has not created their medical history yet.",
            });
        }

        res.status(200).json({
            success: true,
            data: patientMedicalHistory,
        });
    } catch (error) {
        console.error("Error fetching patient medical history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient medical history",
            error: error.message,
        });
    }
};


// Get hospital/doctor specific records
export const getProviderMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { role, id, hospitalId } = req.user;

        let query = { patientId };

        // Filter based on provider
        if (role === "doctor") {
            query.doctorId = id;
        } else if (role === "hospital") {
            query.hospitalId = id;
        }

        const records = await MedicalRecord.find(query)
            .populate("doctorId", "name type")
            .sort({ visitDate: -1 });

        res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error("Error fetching provider records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch records",
            error: error.message,
        });
    }
};

// Request access to patient medical history
// In medicalRecord.controller.js
export const requestMedicalAccess = async (req, res) => {
    try {
        console.log("=== Request Medical Access ===");
        console.log("User:", req.user);
        console.log("Body:", req.body);
        console.log("Doctor:", req.doctor);
        console.log("Hospital:", req.hospital);

        const { patientId, purpose, requestedData, accessLevel } = req.body;

        // Validate required fields
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        // Check for existing request
        const existingRequest = await MedicalAccessRequest.findOne({
            patientId,
            requesterId: req.user.id,
            requesterType: req.user.role,
            status: { $in: ["pending", "approved"] },
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Active access request already exists",
            });
        }

        const accessRequest = new MedicalAccessRequest({
            patientId,
            requesterId: req.user.id,
            requesterType: req.user.role,
            purpose: purpose || "Medical consultation and treatment",
            requestedData: requestedData || ["medical_history", "prescriptions"],
            accessLevel: accessLevel || "read_only",
        });

        await accessRequest.save();

        res.status(201).json({
            success: true,
            message: "Access request sent to patient",
            data: accessRequest,
        });
    } catch (error) {
        console.error("Error requesting access:", error);
        res.status(500).json({
            success: false,
            message: "Failed to request access",
            error: error.message,
        });
    }
};


// Patient approves/rejects access request
export const respondToAccessRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, rejectionReason, accessDuration } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        // Must be patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can respond to access requests",
            });
        }

        const accessRequest = await MedicalAccessRequest.findById(requestId);

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: "Access request not found",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        // Verify ownership
        if (accessRequest.patientId.toString() !== patient._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access request response",
            });
        }

        // Update request
        accessRequest.status = status;
        accessRequest.respondedAt = new Date();

        if (status === "approved") {
            accessRequest.accessGrantedAt = new Date();
            accessRequest.accessExpiresAt = new Date(
                Date.now() + (accessDuration || 90) * 24 * 60 * 60 * 1000
            );
            accessRequest.rejectionReason = undefined;
        }

        if (status === "rejected") {
            accessRequest.rejectionReason =
                rejectionReason || "Rejected by patient";
            accessRequest.accessGrantedAt = undefined;
            accessRequest.accessExpiresAt = undefined;
        }

        await accessRequest.save();

        res.status(200).json({
            success: true,
            message: `Access request ${status}`,
            data: accessRequest,
        });
    } catch (error) {
        console.error("Error responding to access request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to respond to request",
            error: error.message,
        });
    }
};

// Get patient's access requests (for patient to manage)
export const getPatientAccessRequests = async (req, res) => {
    try {
        const { patientId } = req.params;

        const requests = await MedicalAccessRequest.find({ patientId })
            .populate("requesterId", "name profilePhoto")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Error fetching access requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch access requests",
            error: error.message,
        });
    }
};

// Revoke access
export const revokeAccess = async (req, res) => {
    try {
        const { requestId } = req.params;

        const accessRequest = await MedicalAccessRequest.findById(requestId);

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: "Access request not found",
            });
        }

        accessRequest.status = "revoked";
        await accessRequest.save();

        res.status(200).json({
            success: true,
            message: "Access revoked successfully",
        });
    } catch (error) {
        console.error("Error revoking access:", error);
        res.status(500).json({
            success: false,
            message: "Failed to revoke access",
            error: error.message,
        });
    }
};

// Helper function to update patient history summary
const updatePatientHistorySummary = async (patientId) => {
    try {
        const records = await MedicalRecord.find({ patientId });

        const summary = await PatientMedicalHistory.findOneAndUpdate(
            { patientId },
            {
                $set: {
                    "statistics.totalVisits": records.length,
                    "statistics.lastVisitDate": records[0]?.visitDate,
                    "statistics.totalPrescriptions": records.reduce(
                        (sum, r) => sum + (r.prescriptions?.length || 0),
                        0
                    ),
                    "statistics.totalLabTests": records.reduce(
                        (sum, r) => sum + (r.labTests?.length || 0),
                        0
                    ),
                },
            },
            { upsert: true, new: true }
        );

        return summary;
    } catch (error) {
        console.error("Error updating patient summary:", error);
    }
};

// Get approved access list for providers (doctors/hospitals)
export const getApprovedAccessList = async (req, res) => {
    try {
        const { role, id } = req.user;

        // Build query based on role
        let query = {
            status: "approved",
            accessExpiresAt: { $gt: new Date() }, // Only active access
        };

        if (role === "doctor") {
            query.requesterId = id;
            query.requesterType = "doctor";
        } else if (role === "hospital") {
            query.requesterId = id;
            query.requesterType = "hospital";
        } else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const approvedRequests = await MedicalAccessRequest.find(query)
            .populate("patientId", "name age gender bloodGroup profilePhoto")
            .sort({ accessGrantedAt: -1 });

        res.status(200).json({
            success: true,
            data: approvedRequests,
        });
    } catch (error) {
        console.error("Error fetching approved access:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch approved access",
            error: error.message,
        });
    }
};

// Get provider's access requests (all statuses - pending, approved, rejected)
export const getProviderAccessRequests = async (req, res) => {
    try {
        const { role, id } = req.user;

        // Build query based on role
        let query = {};

        if (role === "doctor") {
            query.requesterId = id;
            query.requesterType = "doctor";
        } else if (role === "hospital") {
            query.requesterId = id;
            query.requesterType = "hospital";
        } else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const requests = await MedicalAccessRequest.find(query)
            .populate("patientId", "name age gender bloodGroup profilePhoto")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Error fetching provider requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch access requests",
            error: error.message,
        });
    }
};

// Create/Update Patient Medical History by Patient (Self-reported)
export const createOrUpdatePatientMedicalHistory = async (req, res) => {
    try {
        // Verify user is a patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can create their own medical history",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        const {
            chronicConditions,
            allergies,
            currentMedications,
            surgeries,
            immunizations,
            familyHistory,
            socialHistory,
            emergencyContacts,
            bloodType,
            privacySettings,
        } = req.body;

        // Check if medical history already exists
        let medicalHistory = await PatientMedicalHistory.findOne({
            patientId: patient._id,
        });

        if (medicalHistory) {
            // Update existing medical history
            medicalHistory.chronicConditions =
                chronicConditions || medicalHistory.chronicConditions;
            medicalHistory.allergies = allergies || medicalHistory.allergies;
            medicalHistory.currentMedications =
                currentMedications || medicalHistory.currentMedications;
            medicalHistory.surgeries = surgeries || medicalHistory.surgeries;
            medicalHistory.immunizations =
                immunizations || medicalHistory.immunizations;
            medicalHistory.familyHistory =
                familyHistory || medicalHistory.familyHistory;
            medicalHistory.socialHistory =
                socialHistory || medicalHistory.socialHistory;
            medicalHistory.emergencyContacts =
                emergencyContacts || medicalHistory.emergencyContacts;
            medicalHistory.bloodType = bloodType || medicalHistory.bloodType;
            medicalHistory.privacySettings =
                privacySettings || medicalHistory.privacySettings;

            await medicalHistory.save();

            return res.status(200).json({
                success: true,
                message: "Medical history updated successfully",
                data: medicalHistory,
            });
        } else {
            // Create new medical history
            medicalHistory = new PatientMedicalHistory({
                patientId: patient._id,
                chronicConditions: chronicConditions || [],
                allergies: allergies || [],
                currentMedications: currentMedications || [],
                surgeries: surgeries || [],
                immunizations: immunizations || [],
                familyHistory: familyHistory || [],
                socialHistory: socialHistory || {},
                emergencyContacts: emergencyContacts || [],
                bloodType: bloodType,
                privacySettings: privacySettings || {
                    allowDataSharing: false,
                    allowResearchUse: false,
                },
                statistics: {
                    totalVisits: 0,
                    lastVisitDate: null,
                    totalPrescriptions: 0,
                    totalLabTests: 0,
                },
            });

            await medicalHistory.save();

            return res.status(201).json({
                success: true,
                message: "Medical history created successfully",
                data: medicalHistory,
            });
        }
    } catch (error) {
        console.error("Error creating/updating medical history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save medical history",
            error: error.message,
        });
    }
};

// Get Patient's Own Medical History
export const getMyMedicalHistory = async (req, res) => {
    try {
        // Verify user is a patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can access this endpoint",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        const medicalHistory = await PatientMedicalHistory.findOne({
            patientId: patient._id,
        });

        if (!medicalHistory) {
            return res.status(404).json({
                success: false,
                message: "Medical history not found. Please create one first.",
            });
        }

        res.status(200).json({
            success: true,
            data: medicalHistory,
        });
    } catch (error) {
        console.error("Error fetching medical history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch medical history",
            error: error.message,
        });
    }
};

// Update specific section of medical history
export const updateMedicalHistorySection = async (req, res) => {
    try {
        // Verify user is a patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can update their medical history",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        const { section } = req.params; // e.g., 'allergies', 'medications', 'surgeries'
        const updateData = req.body;

        // Allowed sections to update
        const allowedSections = [
            "chronicConditions",
            "allergies",
            "currentMedications",
            "surgeries",
            "immunizations",
            "familyHistory",
            "socialHistory",
            "emergencyContacts",
            "bloodType",
            "privacySettings",
        ];

        if (!allowedSections.includes(section)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section name",
            });
        }

        const medicalHistory = await PatientMedicalHistory.findOne({
            patientId: patient._id,
        });

        if (!medicalHistory) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical history not found. Please create one first.",
            });
        }

        // Update specific section
        medicalHistory[section] = updateData;
        await medicalHistory.save();

        res.status(200).json({
            success: true,
            message: `${section} updated successfully`,
            data: medicalHistory,
        });
    } catch (error) {
        console.error("Error updating medical history section:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update medical history section",
            error: error.message,
        });
    }
};

// Add single item to array section (e.g., add one allergy)
export const addMedicalHistoryItem = async (req, res) => {
    try {
        // Verify user is a patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can add to their medical history",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        const { section } = req.params;
        const itemData = req.body;

        // Allowed array sections
        const allowedArraySections = [
            "chronicConditions",
            "allergies",
            "currentMedications",
            "surgeries",
            "immunizations",
            "familyHistory",
            "emergencyContacts",
        ];

        if (!allowedArraySections.includes(section)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section or section is not an array",
            });
        }

        const medicalHistory = await PatientMedicalHistory.findOne({
            patientId: patient._id,
        });

        if (!medicalHistory) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical history not found. Please create one first.",
            });
        }

        // Add item to array
        medicalHistory[section].push(itemData);
        await medicalHistory.save();

        res.status(200).json({
            success: true,
            message: `Item added to ${section} successfully`,
            data: medicalHistory,
        });
    } catch (error) {
        console.error("Error adding medical history item:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add item",
            error: error.message,
        });
    }
};

// Delete single item from array section
export const deleteMedicalHistoryItem = async (req, res) => {
    try {
        // Verify user is a patient
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can delete from their medical history",
            });
        }

        // Find patient profile linked to logged-in user
        const patient = await Patient.findOne({ userId: req.user._id });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found",
            });
        }

        const { section, itemId } = req.params;

        // Allowed array sections
        const allowedArraySections = [
            "chronicConditions",
            "allergies",
            "currentMedications",
            "surgeries",
            "immunizations",
            "familyHistory",
            "emergencyContacts",
        ];

        if (!allowedArraySections.includes(section)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section or section is not an array",
            });
        }

        const medicalHistory = await PatientMedicalHistory.findOne({
            patientId: patient._id,
        });

        if (!medicalHistory) {
            return res.status(404).json({
                success: false,
                message: "Medical history not found",
            });
        }

        // Remove item from array using MongoDB $pull
        medicalHistory[section] = medicalHistory[section].filter(
            (item) => item._id.toString() !== itemId
        );

        await medicalHistory.save();

        res.status(200).json({
            success: true,
            message: `Item removed from ${section} successfully`,
            data: medicalHistory,
        });
    } catch (error) {
        console.error("Error deleting medical history item:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete item",
            error: error.message,
        });
    }
};
