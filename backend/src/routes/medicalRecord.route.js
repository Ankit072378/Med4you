import express from "express";
import {
    createMedicalRecord,
    getPatientMedicalHistory,
    getProviderMedicalRecords,
    getPatientMedicalHistoryForProvider,
    requestMedicalAccess,
    respondToAccessRequest,
    getPatientAccessRequests,
    revokeAccess,
    getApprovedAccessList,
    getProviderAccessRequests,
    createOrUpdatePatientMedicalHistory,
    getMyMedicalHistory,
    updateMedicalHistorySection,
    addMedicalHistoryItem,
    deleteMedicalHistoryItem,
} from "../controllers/medicalRecord.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";

const router = express.Router();

// Medical Records
router.post(
    "/create",
    protectRoute,
    authorizeRoles("hospital", "doctor"),
    createMedicalRecord
);

router.get(
    "/patient/:patientId/history",
    protectRoute,
    authorizeRoles("patient", "doctor", "hospital"),
    getPatientMedicalHistory
);

// Get patient's medical history (includes self-reported data)
router.get(
    "/patient/:patientId/medical-history",
    protectRoute,
    authorizeRoles("doctor", "hospital"),
    getPatientMedicalHistoryForProvider // New dedicated endpoint
);

router.get(
    "/provider/:patientId",
    protectRoute,
    authorizeRoles("doctor", "hospital"),
    getProviderMedicalRecords
);

// Access Management
router.post(
    "/request-access",
    protectRoute,
    authorizeRoles("doctor", "hospital"),
    requestMedicalAccess
);

router.put(
    "/access-request/:requestId/respond",
    protectRoute,
    authorizeRoles("patient"),
    respondToAccessRequest
);

router.get(
    "/access-requests/:patientId",
    protectRoute,
    authorizeRoles("patient"),
    getPatientAccessRequests
);

router.put(
    "/access-request/:requestId/revoke",
    protectRoute,
    authorizeRoles("patient"),
    revokeAccess
);

router.get(
    "/approved-access",
    protectRoute,
    authorizeRoles("doctor", "hospital"),
    getApprovedAccessList
);

router.get(
    "/provider-requests",
    protectRoute,
    authorizeRoles("doctor", "hospital"),
    getProviderAccessRequests
);

// Patient's own medical history management
router.post(
    "/my-history",
    protectRoute,
    authorizeRoles("patient"),
    createOrUpdatePatientMedicalHistory
);

router.get(
    "/my-history",
    protectRoute,
    authorizeRoles("patient"),
    getMyMedicalHistory
);

router.put(
    "/my-history/:section",
    protectRoute,
    authorizeRoles("patient"),
    updateMedicalHistorySection
);

router.post(
    "/my-history/:section/add",
    protectRoute,
    authorizeRoles("patient"),
    addMedicalHistoryItem
);

router.delete(
    "/my-history/:section/:itemId",
    protectRoute,
    authorizeRoles("patient"),
    deleteMedicalHistoryItem
);

export default router;
