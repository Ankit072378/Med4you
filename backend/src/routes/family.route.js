// routes/family.js
import express from "express";
import {
    familyLogin,
    requestAccess,
    getAccessStatus,
    getStreamUrl,
} from "../controllers/family.controller.js";
// import {
//     authenticate,
//     authorizeRole,
//     checkApproval,
// } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", familyLogin);
router.post(
    "/request-access",
    // authenticate,
    // authorizeRole("family"),
    requestAccess
);
router.get(
    "/access-status/:patientId",
    // authenticate,
    // authorizeRole("family"),
    getAccessStatus
);
router.get(
    "/stream/:patientId",
    // authenticate,
    // authorizeRole("family"),
    // checkApproval,
    getStreamUrl
);

export default router;