// controllers/hospital.controller.js
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";

export async function getHospitals(req, res) {
    try {
        const hospitals = await Hospital.find().populate({
            path: "userId",
            match: { isVerified: true },
            select: "isVerified",
        });

        const verifiedHospitals = hospitals.filter((h) => h.userId !== null);

        return res.status(200).json({
            success: true,
            data: verifiedHospitals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in getHospitals: " + error.message,
        });
    }
}


export async function getHospitalById(req, res) {
    const hospital = await Hospital.findById(req.params.id).populate({
        path: "userId",
        match: { isVerified: true },
    });

    if (!hospital || !hospital.userId) {
        return res.status(404).json({
            success: false,
            message: "Hospital not verified",
        });
    }

    return res.json({ success: true, data: hospital });
}


export const bookBed = async (req, res) => {
    try {
        const { hospitalId, bedId } = req.params;
        const {
            status,
            reservationTime,
            expectedReleaseTime,
            notes,
            patientId,
        } = req.body;

        // Find hospital
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        // Find the bed inside hospital
        const bed = hospital.beds.id(bedId);
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found",
            });
        }

        // Prevent booking if already occupied/reserved
        if (bed.status !== "available" && status === "occupied") {
            return res.status(400).json({
                success: false,
                message: `Bed is already ${bed.status}`,
            });
        }

        // Update fields
        if (status) bed.status = status;
        if (notes) bed.notes = notes;
        if (reservationTime) bed.reservationTime = reservationTime;
        if (expectedReleaseTime) bed.expectedReleaseTime = expectedReleaseTime;

        // Patient assignment
        if (patientId) bed.patientId = patientId;

        // Always update timestamp
        bed.lastUpdated = Date.now();

        await hospital.save();

        return res.status(200).json({
            success: true,
            message: "Bed successfully",
            data: bed,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update bed",
            error: error.message,
        });
    }
};

export async function addBeds(req, res) {
    try {
        const { hospitalId } = req.params;
        const { beds } = req.body; // Array of bed objects

        // Validate that beds is an array
        if (!Array.isArray(beds) || beds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Beds must be a non-empty array",
            });
        }

        // Find the hospital
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        // Verify authorization - only the hospital owner can add beds
        if (req.hospital._id.toString() !== hospitalId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to add beds to this hospital",
            });
        }

        // Get existing bed numbers to check for duplicates
        const existingBedNumbers = hospital.beds.map(bed => bed.bedNumber);

        // Validate new beds
        const newBedNumbers = beds.map(bed => bed.bedNumber);
        const duplicates = newBedNumbers.filter(num => 
            existingBedNumbers.includes(num)
        );

        if (duplicates.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Bed numbers already exist: ${duplicates.join(", ")}`,
            });
        }

        // Check for duplicate bed numbers within the new beds array
        const duplicatesInNew = newBedNumbers.filter(
            (num, index) => newBedNumbers.indexOf(num) !== index
        );

        if (duplicatesInNew.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Duplicate bed numbers in request: ${duplicatesInNew.join(", ")}`,
            });
        }

        // Validate each bed object
        for (const bed of beds) {
            if (!bed.bedNumber || !bed.type || !bed.price) {
                return res.status(400).json({
                    success: false,
                    message: "Each bed must have bedNumber, type, and price",
                });
            }

            // Validate bed type
            const validTypes = ["general", "icu", "emergency", "vip"];
            if (!validTypes.includes(bed.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid bed type: ${bed.type}. Must be one of: ${validTypes.join(", ")}`,
                });
            }

            // Validate status if provided
            if (bed.status) {
                const validStatuses = ["available", "occupied", "reserved"];
                if (!validStatuses.includes(bed.status)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid bed status: ${bed.status}. Must be one of: ${validStatuses.join(", ")}`,
                    });
                }
            }
        }

        // Add beds to hospital
        hospital.beds.push(...beds);
        await hospital.save();

        return res.status(201).json({
            success: true,
            message: `${beds.length} bed(s) added successfully`,
            data: hospital.beds,
        });
    } catch (error) {
        console.error("Error in addBeds:", error);
        return res.status(500).json({
            success: false,
            message: "Error in addBeds: " + error.message,
        });
    }
}



export async function addDoctor(req, res) {
    try {
        const { doctorId } = req.body;
        const hospitalId = req.hospital._id; // From protectRoute middleware

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        // Check if doctor already added
        const hospital = await Hospital.findById(hospitalId);
        if (hospital.doctorIds.includes(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Doctor already associated with this hospital",
            });
        }

        await Hospital.findByIdAndUpdate(hospitalId, {
            $addToSet: { doctorIds: doctorId },
        });

        await Doctor.findByIdAndUpdate(doctorId, {
            $addToSet: { hospitals: hospitalId },
        });

        res.status(200).json({
            success: true,
            message: "Doctor added successfully to hospital",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in sendDoctorInvitation: " + error.message,
        });
    }
}

export async function removeDoctorFromHospital(req, res) {
    try {
        const { doctorId } = req.body;
        const hospitalId = req.hospital._id;

        // Remove doctor from hospital
        await Hospital.findByIdAndUpdate(hospitalId, {
            $pull: { doctorIds: doctorId },
        });

        // Remove hospital from doctor
        await Doctor.findByIdAndUpdate(doctorId, {
            $pull: { hospitals: hospitalId },
        });

        res.status(200).json({
            success: true,
            message: "Doctor removed from hospital successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in removeDoctorFromHospital: " + error.message,
        });
    }
}



// controllers/hospitalController.js
import ViewRequest from "../models/ViewRequest.js";

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await ViewRequest.find({ status: "pending" })
            .populate("patientId")
            .sort({ requestedAt: -1 });
        
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const approveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const request = await ViewRequest.findByIdAndUpdate(
            requestId,
            {
                status: "approved",
                approvedBy: req.user._id,
                approvedAt: new Date(),
            },
            { new: true }
        );
        
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        
        res.json({ message: "Request approved", request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const request = await ViewRequest.findByIdAndUpdate(
            requestId,
            { status: "rejected", approvedBy: req.user._id },
            { new: true }
        );
        
        res.json({ message: "Request rejected", request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
