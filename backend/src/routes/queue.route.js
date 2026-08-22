import express from "express";
import {
    getLiveQueue,
    joinQueue,
    getQueuePosition,
    callNextPatient,
    startConsultation,
    updateDoctorStatus,
    addBreak,
} from "../controllers/queue.controller.js";

const router = express.Router();

// Get live queue
router.get("/doctor/:doctorId", getLiveQueue);

// Join queue
router.post("/join", joinQueue);

// Get queue position
router.get("/position/:appointmentId", getQueuePosition);

// Call next patient
router.post("/:queueId/next", callNextPatient);

// Start consultation
router.post("/consultation/:appointmentId/start", startConsultation);

// Update doctor status
router.patch("/:queueId/status", updateDoctorStatus);

// Add break
router.post("/:queueId/break", addBreak);

export default router;