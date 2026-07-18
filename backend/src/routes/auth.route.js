import express from "express";
import {
    login,
    patientSignup,
    hospitalSignup,
    doctorSignup,
    postProfilePhoto,
    postPhotos,
    logout,uploadVerificationDocs,
    adminSignup,addFcmToken,removeFcmToken
} from "../controllers/auth.controller.js";
import protectRoute from "../middlewares/protectRoute.middleware.js";
import { uploadMultiple } from "../config/uploadMultiple.js";
import upload from "../config/multer.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/patientSignup", patientSignup);
router.post("/doctorSignup", doctorSignup);
router.post("/hospitalSignup", hospitalSignup);
router.post("/adminSignup", adminSignup);
router.post("/logout", logout);
router.post("/add-token", protectRoute, addFcmToken);
router.post("/remove-token", protectRoute, removeFcmToken);

router.post(
    "/profilePhoto",
    protectRoute,
    authorizeRoles("doctor", "patient"),
    upload.array("images", 1),
    uploadMultiple,
    postProfilePhoto
); // for Doctor and Patient

router.post(
    "/postPhotos",protectRoute,
    upload.array("images", 4),
    uploadMultiple,
    postPhotos
); // for Hospital

router.post(
    "/upload-verification/:userId",
    protectRoute,
    upload.array("images", 5),
    uploadMultiple,
    uploadVerificationDocs
); // for hospital and doctors


router.get("myself", protectRoute);

router.get("/me", protectRoute, async (req, res) => {
    try {
        let userData;
        if (req.user.role === "patient") {
            userData = await Patient.findOne({ userId: req.user._id });
        } else if (req.user.role === "doctor") {
            userData = await Doctor.findOne({ userId: req.user._id }).populate(
                "hospitals"
            );
        } else if (req.user.role === "hospital") {
            userData = await Hospital.findOne({ userId: req.user._id });
        }
        res.status(200).json({
            success: true,
            data: { user: req.user, profile: userData },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
