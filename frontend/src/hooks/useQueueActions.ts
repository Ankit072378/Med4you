import { useState } from "react";
import * as queueService from "@/services/queueService";

export function useQueueActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGetLiveQueue = async (doctorId, date) => {
        setLoading(true);
        setError(null);

        try {
            const response = await queueService.getLiveQueue(doctorId, date);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch queue";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleJoinQueue = async (appointmentId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await queueService.joinQueue(appointmentId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to join queue";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetQueuePosition = async (appointmentId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await queueService.getQueuePosition(appointmentId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch position";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleCallNextPatient = async (queueId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await queueService.callNextPatient(queueId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to call next patient";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDoctorStatus = async (queueId, status) => {
        setLoading(true);
        setError(null);

        try {
            const response = await queueService.updateDoctorStatus(
                queueId,
                status
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to update status";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        handleGetLiveQueue,
        handleJoinQueue,
        handleGetQueuePosition,
        handleCallNextPatient,
        handleUpdateDoctorStatus,
        loading,
        error,
        clearError,
    };
}
