// controllers/admin.controller.js
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

export const getPendingVerifications = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ["doctor", "hospital"] },
            verificationStatus: "pending",
        }).lean();

        const results = [];

        for (const user of users) {
            if (user.role === "doctor") {
                const doctor = await Doctor.findOne({
                    userId: user._id,
                }).lean();
                results.push({
                    user,
                    profile: doctor,
                });
            } else if (user.role === "hospital") {
                const hospital = await Hospital.findOne({
                    userId: user._id,
                }).lean();
                results.push({
                    user,
                    profile: hospital,
                });
            }
        }

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyUser = async (req, res) => {
    const { status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.verificationStatus = status;
    user.isVerified = status === "approved";

    await user.save();

    res.json({
        success: true,
        message: `User ${status}`,
    });
};