import express from "express";
import {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getAppointmentById,
    cancelAppointment,
    updateAppointmentStatus,
    completeConsultation,
} from "../controllers/appointment.controller.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";

const router = express.Router();

// Book appointment
router.post("/book", protectRoute, bookAppointment);

// Get patient appointments
router.get("/patient/:patientId", protectRoute, getPatientAppointments);

// Get doctor appointments
router.get("/doctor/:doctorId", protectRoute, getDoctorAppointments);

// Get appointment by ID
router.get("/:appointmentId", protectRoute, getAppointmentById);

// Cancel appointment
router.put("/:appointmentId/cancel", protectRoute, cancelAppointment);

// Update appointment status
router.put("/:appointmentId/status", protectRoute, updateAppointmentStatus);

// Complete consultation (add medical records)
router.put("/:appointmentId/complete", protectRoute, completeConsultation);

export default router;