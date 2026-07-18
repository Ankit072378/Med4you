import Doctor from "../models/Doctor.js";

export async function getDoctors(req, res) {
    try {
        const doctors = await Doctor.find().populate({
            path: "userId",
            match: { isVerified: true }, // only verified users
            select: "phone isVerified",
        });

        const verifiedDoctors = doctors.filter((d) => d.userId !== null);

        return res.status(200).json({
            success: true,
            data: verifiedDoctors,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in getDoctors: " + error.message,
        });
    }
}

export async function getDoctor(req, res) {
    try {
        const doctor = await Doctor.findById(req.params.id).populate({
            path: "userId",
            match: { isVerified: true },
        });

        if (!doctor || !doctor.userId) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found or not verified",
            });
        }

        return res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in getDoctor: " + error.message,
        });
    }
}


export async function getDoctorByUserId(req, res) {
    try {
        const id = req.params.userId;
        const doctor = await Doctor.findOne({userId:id})

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in getDoctor: " + error.message,
        });
    }
}


// Update Doctor (partial update)
export async function updateDoctor(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: doctor,
        });
    } catch (error) {
        console.error("Update doctor error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update doctor",
            error: error.message,
        });
    }
}