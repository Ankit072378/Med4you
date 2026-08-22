import express from "express";
import {
    createMonitoringRequest,
    getHospitalMonitoringRequests,
    getUserMonitoringRequests,
    acceptMonitoringRequest,
    rejectMonitoringRequest,
    getActiveMonitoringSession,
    endMonitoringSession,
} from "../controllers/monitoring.controller.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";

const router = express.Router();

// Patient/Family routes
router.post("/request", protectRoute, createMonitoringRequest);
router.get("/user/requests", protectRoute, getUserMonitoringRequests);
router.get("/active-session", protectRoute, getActiveMonitoringSession);

// Hospital routes
router.get(
    "/hospital/:hospitalId/requests",
    protectRoute,
    getHospitalMonitoringRequests
);
router.patch("/request/:requestId/accept", protectRoute, acceptMonitoringRequest);
router.patch("/request/:requestId/reject", protectRoute, rejectMonitoringRequest);
router.patch("/request/:requestId/end", protectRoute, endMonitoringSession);

export default router;