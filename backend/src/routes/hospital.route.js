// routes/hospital.routes.js
import express from "express";
import {
    removeDoctorFromHospital,
    addDoctor,
    bookBed,
    getHospitals,
    getHospitalById,
    addBeds,
} from "../controllers/hospital.controller.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";


import {
    getPendingRequests,
    approveRequest,
    rejectRequest,
} from "../controllers/hospital.controller.js";

const router = express.Router();

router.get("/", getHospitals);
router.get("/:id", getHospitalById);

router.put("/:hospitalId/beds/:bedId", bookBed);

router.post(
    "/addDoctor",
    protectRoute,
    authorizeRoles("hospital"),
    addDoctor
); 

router.post(
    "/:hospitalId/beds",
    protectRoute,
    authorizeRoles("hospital"),
    addBeds
);

router.delete(
    "/removeDoctor",
    protectRoute,
    authorizeRoles("hospital"),
    removeDoctorFromHospital
);


router.get("/requests/pending", getPendingRequests);
router.put("/requests/:requestId/approve", approveRequest);
router.put("/requests/:requestId/reject", rejectRequest);

export default router;

// import { authenticate, authorizeRole } from "../middleware/auth.js";


