import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import * as emergencyService from "@/services/emergencyServices"; // Your emergency service file

export function useEmergencyActions() {
    const { setUser, setProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Trigger Emergency SOS (Patient only)
    const handleTriggerEmergency = async (location: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = { location };
            const response = await emergencyService.triggerEmergency(data);

            if (response.success) {
                return { success: true, data: response };
            }
            return { success: false, error: "Emergency trigger failed" };
        } catch (err: any) {
            const errorMessage = err.message || "Triggering Emergency failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get user's emergency notifications (Emergency contacts)
    const handleGetUserNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await emergencyService.getUserNotifications();
            return { success: true, data: response };
        } catch (err: any) {
            const errorMessage = err.message || "Getting notifications failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get unread notification count (for badge)
    const handleGetUnreadNotificationCount = async () => {
        setLoading(true);
        setError(null);

        try {
            const response =
                await emergencyService.getUnreadNotificationCount();
            return { success: true, data: response };
        } catch (err: any) {
            const errorMessage = err.message || "Getting unread count failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as resolved
    const handleMarkNotificationResolved = async (notificationId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await emergencyService.markNotificationResolved(
                notificationId
            );

            if (response.success) {
                return { success: true, data: response };
            }
            return { success: false, error: "Marking resolved failed" };
        } catch (err: any) {
            const errorMessage =
                err.message || "Marking notification resolved failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        // actions
        handleTriggerEmergency,
        handleGetUserNotifications,
        handleGetUnreadNotificationCount,
        handleMarkNotificationResolved,

        // state
        loading,
        error,

        // helpers
        clearError,
    };
}
