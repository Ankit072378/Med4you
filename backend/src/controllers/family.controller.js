import FamilyUser from "../models/FamilyUser.js";
import ViewRequest from "../models/ViewRequest.js";
import Patient from "../models/Patient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const familyLogin = async (req, res) => {
    try {
        const { userId, password } = req.body;

        const family = await FamilyUser.findOne({ userId }).populate(
            "patientId"
        );

        if (!family) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, family.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // AUTO-APPROVE: Create or update access request to approved status
        await ViewRequest.findOneAndUpdate(
            {
                patientId: family.patientId._id,
                familyUserId: family.userId,
            },
            {
                patientId: family.patientId._id,
                familyUserId: family.userId,
                status: "approved",
                approvedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        const token = jwt.sign(
            {
                userId: family.userId,
                role: "family",
                patientId: family.patientId._id,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "24h" }
        );

        res.json({
            token,
            patient: {
                id: family.patientId._id,
                name: family.patientId.name,
                age: family.patientId.age,
            },
            // Send approved status directly
            accessStatus: "approved",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const requestAccess = async (req, res) => {
    try {
        const { patientId } = req.body;
        const familyUserId = req.user.userId;

        // Check existing request
        const existing = await ViewRequest.findOne({
            patientId,
            familyUserId,
            status: { $in: ["pending", "approved"] },
        });

        if (existing) {
            return res.status(400).json({
                message: "Request already exists",
                status: existing.status,
            });
        }

        const request = await ViewRequest.create({
            patientId,
            familyUserId,
        });

        res.status(201).json({ message: "Request submitted", request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAccessStatus = async (req, res) => {
    try {
        const { patientId } = req.params;
        const familyUserId = req.user.userId;

        const request = await ViewRequest.findOne({
            patientId,
            familyUserId,
        }).sort({ createdAt: -1 });

        if (!request) {
            return res.json({ status: "none" });
        }

        res.json({ status: request.status, request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStreamUrl = async (req, res) => {
    try {
        const { patientId } = req.params;

        res.json({
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Sample HLS stream
            patientName: "Rahul Verma",
            roomNumber: "305",
            audioEnabled: false,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
