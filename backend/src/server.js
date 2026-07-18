import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.route.js"
import hospitalRoutes from "./routes/hospital.route.js"
import doctorRoutes from "./routes/doctor.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import queueRoutes from "./routes/queue.route.js";
import medicalRecordRoutes from "./routes/medicalRecord.route.js";
import familyRoutes from "./routes/family.route.js";
import emergencyRoutes from "./routes/emergency.route.js";
import monitoringRoutes from "./routes/monitoring.route.js"
import adminRoutes from "./routes/admin.route.js"
import { connectDB } from "./config/db.js";

import User from "./models/User.js";
import Patient from "./models/Patient.js";

const app = express();
dotenv.config();
const PORT=process.env.PORT || 3000

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}))

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/doctor", doctorRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/queue", queueRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/family", familyRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/patient/:phone",async (req, res) => {
    try {
        const phone = req.params.phone;
        const user = await User.findOne({phone}).select("-password");
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "User not found",
                    });
        }
        const patient = await Patient.findOne({ userId: user._id });
        res.status(200).json({
            success: true,
            message: "Monitoring session ended",
            patient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error for patient Route" });
    }
})
app.use("/monitoring", monitoringRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on PORT:${PORT}`);
})