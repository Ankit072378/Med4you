import Patient from "../models/Patient.js";
import User from "../models/User.js";
import EmergencyNotification from "../models/EmergencyNotification.js";
import { messaging } from "../config/firebaseAdmin.js";

export const triggerEmergency = async (req, res) => {
    try {
        const { location } = req.body;
        const patientId = req.patient._id;

        const patient = await Patient.findOne({
            userId: req.user._id,
        }).populate("userId");
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        const emergencyPhones = patient.emergencyContacts.map(
            (contact) => contact.phone
        );
        const emergencyUsers = await User.find({
            phone: { $in: emergencyPhones },
        }).select("phone fcmTokens name");

        if (emergencyUsers.length === 0) {
            return res.status(200).json({
                message: "No registered emergency contacts found",
                totalContacts: patient.emergencyContacts.length,
            });
        }

        // Create notification first
        const notification = new EmergencyNotification({
            patientId: patient._id,
            patientName: patient.name,
            patientPhone: req.user.phone,
            location,
            bloodGroup: patient.bloodGroup,
            age: patient.age,
            emergencyContactPhones: patient.emergencyContacts.map(
                (contact) => ({
                    phone: contact.phone,
                    name: contact.name,
                    read: false,
                })
            ),
        });

        await notification.save();

        // Send FCM notifications to active tokens
        const activeTokens = emergencyUsers
            .flatMap((user) =>
                user.fcmTokens
                    .filter((token) => token.isActive)
                    .map((token) => token.token)
            )
            .filter(Boolean); // Remove null/undefined

        if (activeTokens.length > 0) {
            const message = {
                notification: {
                    title: "🚨 EMERGENCY ALERT",
                    body: `${patient.name} needs immediate help! Location: ${
                        location || "Location not available"
                    }`,
                },
                data: {
                    type: "emergency",
                    notificationId: notification._id.toString(),
                    patientName: patient.name,
                    patientPhone: req.user.phone,
                    bloodGroup: patient.bloodGroup,
                    age: patient.age.toString(),
                    route: "/notifications",
                },
                tokens: activeTokens,
                apns: {
                    payload: {
                        aps: {
                            sound: "default",
                            badge: 1,
                        },
                    },
                },
                android: {
                    priority: "high",
                    notification: {
                        sound: "default",
                        channelId: "emergency",
                    },
                },
            };

            try {
                const response = await messaging.sendMulticast(message);

                console.log(
                    `Sent FCM to ${response.successCount} devices, ${response.failureCount} failed`
                );

                // Remove invalid tokens
                if (response.failureCount > 0) {
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                        if (
                            !resp.success &&
                            resp.error?.code ===
                                "messaging/registration-token-not-registered"
                        ) {
                            failedTokens.push(activeTokens[idx]);
                        }
                    });

                    // Remove invalid tokens from database
                    await User.updateMany(
                        { "fcmTokens.token": { $in: failedTokens } },
                        {
                            $pull: {
                                fcmTokens: { token: { $in: failedTokens } },
                            },
                        }
                    );
                }
            } catch (fcmError) {
                console.error("FCM send error:", fcmError);
            }
        }

        res.status(200).json({
            success: true,
            message: "Emergency notification created and sent",
            notificationId: notification._id,
            notifiedContacts: emergencyUsers.length,
            fcmSent: activeTokens.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const userPhone = req.user.phone; // From auth middleware

        // Find all notifications where this user's phone is in emergencyContactPhones
        const notifications = await EmergencyNotification.find({
            "emergencyContactPhones.phone": userPhone,
            status: { $ne: "resolved" }, // Don't show resolved ones
        })
            .sort({ createdAt: -1 })
            .populate("patientId", "name profilePhoto");

        // Mark as read for this user
        await EmergencyNotification.updateMany(
            { "emergencyContactPhones.phone": userPhone },
            {
                $set: {
                    "emergencyContactPhones.$.read": true,
                },
            }
        );

        res.status(200).json({
            notifications,
            unreadCount: notifications.filter(
                (n) =>
                    n.emergencyContactPhones.find((c) => c.phone === userPhone)
                        ?.read === false
            ).length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userPhone = req.user.phone;

        const count = await EmergencyNotification.countDocuments({
            "emergencyContactPhones.phone": userPhone,
            "emergencyContactPhones.read": false,
            status: "pending",
        });

        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const markNotificationResolved = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await EmergencyNotification.findByIdAndUpdate(notificationId, {
            status: "resolved",
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
