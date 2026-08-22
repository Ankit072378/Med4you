import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import jwt from "jsonwebtoken";

export default async function protectRoute(req, res, next) {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        req.user = user;
        if (user.role === "patient") {
            req.patient = await Patient.findOne({ userId: user._id });
        } else if (user.role === "doctor") {
            req.doctor = await Doctor.findOne({ userId: user._id }).populate(
                "hospitals",
                "name city address"
            );
        } else if (user.role === "hospital") {
            req.hospital = await Hospital.findOne({
                userId: user._id,
            }).populate(
                "doctorIds",
                "name type specializations experience fee"
            );
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }
}
