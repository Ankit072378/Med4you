import express from "express";

import { getDoctors,getDoctor,updateDoctor,getDoctorByUserId } from "../controllers/doctor.controller.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctor);
router.get("/userId/:userId", getDoctorByUserId);
router.patch("/:id", updateDoctor);

export default router;