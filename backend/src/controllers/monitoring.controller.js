import MonitoringRequest from "../models/MonitoringRequest.js";
import Patient from "../models/Patient.js";
import Hospital from "../models/Hospital.js";
import streamClient, {
    generateUserToken,
    createVideoCall,
    endVideoCall,
} from "../config/streamConfig.js";

// Create monitoring request (Patient/Family side)
export const createMonitoringRequest = async (req, res) => {
    try {
        const { patientId, hospitalId, reason } = req.body;
        const requestedBy = req.user.id;

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Verify hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        // Check if there's already a pending request
        const existingRequest = await MonitoringRequest.findOne({
            patientId,
            hospitalId,
            requestedBy,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending request for this patient",
            });
        }

        // Create new request
        const monitoringRequest = new MonitoringRequest({
            patientId,
            hospitalId,
            requestedBy,
            reason: reason || "Family monitoring request",
        });

        await monitoringRequest.save();

        res.status(201).json({
            success: true,
            message: "Monitoring request sent successfully",
            data: monitoringRequest,
        });
    } catch (error) {
        console.error("Error creating monitoring request:", error);
        res.status(500).json({
            message: "Failed to create monitoring request",
        });
    }
};

// Get all monitoring requests for a hospital
export const getHospitalMonitoringRequests = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { status } = req.query;

        const query = { hospitalId };
        if (status) {
            query.status = status;
        }

        const requests = await MonitoringRequest.find(query)
            .populate("patientId", "name age gender profilePhoto")
            .populate("requestedBy", "phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Error fetching monitoring requests:", error);
        res.status(500).json({
            message: "Failed to fetch monitoring requests",
        });
    }
};

// Get user's monitoring requests
export const getUserMonitoringRequests = async (req, res) => {
    try {
        const requestedBy = req.user.id;
        const { status } = req.query;

        const query = { requestedBy };
        if (status) {
            query.status = status;
        }

        const requests = await MonitoringRequest.find(query)
            .populate("patientId", "name age gender profilePhoto")
            .populate("hospitalId", "name address city")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Error fetching user monitoring requests:", error);
        res.status(500).json({
            message: "Failed to fetch monitoring requests",
        });
    }
};

// Accept monitoring request (Hospital side)
export const acceptMonitoringRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await MonitoringRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: `Request already ${request.status}`,
            });
        }

        // Generate unique call ID
        const callId = `monitoring_${requestId}_${Date.now()}`;
        // Generate Stream user IDs
        const familyUserId = `user_${request.requestedBy}`;
        const hospitalUserId = `hospital_${request.hospitalId}`;

        // Create the livestream call WITH BOTH USERS
        await createVideoCall(callId, hospitalUserId, familyUserId);

        // Generate tokens
        const familyToken = generateUserToken(familyUserId);
        const hospitalToken = generateUserToken(hospitalUserId);

        // Update request
        request.status = "accepted";
        request.callId = callId;
        request.streamToken = familyToken;
        request.startTime = new Date();
        request.endTime = new Date(Date.now() + request.duration * 60 * 1000);

        await request.save();

        // Schedule auto-end after 5 minutes
        setTimeout(async () => {
            try {
                await endVideoCall(callId);
                const req = await MonitoringRequest.findById(requestId);
                if (req && req.status === "accepted") {
                    req.status = "completed";
                    await req.save();
                }
            } catch (error) {
                console.error("Error auto-ending call:", error);
            }
        }, request.duration * 60 * 1000);

        res.status(200).json({
            success: true,
            message: "Monitoring request accepted",
            data: {
                request,
                callId,
                familyToken,
                hospitalToken,
                duration: request.duration,
                apiKey: process.env.STREAM_API_KEY,
            },
        });
    } catch (error) {
        console.error("Error accepting monitoring request:", error);
        res.status(500).json({
            message: "Failed to accept monitoring request",
        });
    }
};

// Reject monitoring request
export const rejectMonitoringRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;

        const request = await MonitoringRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                message: `Request already ${request.status}`,
            });
        }

        request.status = "rejected";
        if (reason) {
            request.reason = reason;
        }

        await request.save();

        res.status(200).json({
            success: true,
            message: "Monitoring request rejected",
            data: request,
        });
    } catch (error) {
        console.error("Error rejecting monitoring request:", error);
        res.status(500).json({
            message: "Failed to reject monitoring request",
        });
    }
};

// Get active monitoring session
export const getActiveMonitoringSession = async (req, res) => {
    try {
        const requestedBy = req.user.id;

        const activeSession = await MonitoringRequest.findOne({
            requestedBy,
            status: "accepted",
            endTime: { $gt: new Date() },
        })
            .populate("patientId", "name age gender profilePhoto")
            .populate("hospitalId", "name address city");

        if (!activeSession) {
            return res.status(404).json({
                success: false,
                message: "No active monitoring session found",
            });
        }

        // Calculate remaining time
        const remainingTime = Math.max(
            0,
            Math.floor((activeSession.endTime - new Date()) / 1000)
        );

        const familyUserId = `user_${req.user.id}`;

        res.status(200).json({
            success: true,
            data: {
                ...activeSession.toObject(),
                remainingTime,
                apiKey: process.env.STREAM_API_KEY,
                userId: familyUserId,
                token: activeSession.streamToken,
            },
        });

    } catch (error) {
        console.error("Error fetching active session:", error);
        res.status(500).json({ message: "Failed to fetch active session" });
    }
};

// End monitoring session manually
export const endMonitoringSession = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await MonitoringRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "accepted") {
            return res.status(400).json({
                message: "No active session to end",
            });
        }

        // End the call
        if (request.callId) {
            await endVideoCall(request.callId);
        }

        request.status = "completed";
        await request.save();

        res.status(200).json({
            success: true,
            message: "Monitoring session ended",
            data: request,
        });
    } catch (error) {
        console.error("Error ending monitoring session:", error);
        res.status(500).json({ message: "Failed to end monitoring session" });
    }
};
