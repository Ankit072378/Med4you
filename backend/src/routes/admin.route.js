import express from "express";
import protectRoute from "../middlewares/protectRoute.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { getPendingVerifications,verifyUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/pending-verifications",
  protectRoute,
  authorizeRoles("admin"),
  getPendingVerifications
);

router.put(
    "/verify-user/:id",
    protectRoute,
    authorizeRoles("admin"),
    verifyUser
);

export default router;