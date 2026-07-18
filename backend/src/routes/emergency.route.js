import express from "express";
import {
    triggerEmergency,
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationResolved,
} from "../controllers/emergency.controller.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";

const router = express.Router();

// Patient triggers emergency
router.post("/trigger", protectRoute, triggerEmergency);

// Get user's notifications (for emergency contacts)
router.get("/my-notifications", protectRoute, getUserNotifications);
router.get("/unread-count", protectRoute, getUnreadNotificationCount);

// Mark as resolved (by emergency contact)
router.patch(
    "/:notificationId/resolve",
    protectRoute,
    markNotificationResolved
);

export default router;