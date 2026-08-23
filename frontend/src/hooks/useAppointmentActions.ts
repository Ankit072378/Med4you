import { useState } from "react";
import * as appointmentService from "@/services/appointmentService";

export function useAppointmentActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleBookAppointment = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.bookAppointment(data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Appointment booking failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetPatientAppointments = async (patientId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.getPatientAppointments(
                patientId
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch appointments";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetDoctorAppointments = async (
        doctorId,
        date,
        endDate = null
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.getDoctorAppointments(
                doctorId,
                date,
                endDate // Pass endDate to service
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch appointments";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };


    const handleGetAppointmentById = async (appointmentId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.getAppointmentById(
                appointmentId
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch appointment";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId, reason) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.cancelAppointment(
                appointmentId,
                reason
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Cancellation failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointmentStatus = async (appointmentId, status) => {
        setLoading(true);
        setError(null);

        try {
            const response = await appointmentService.updateAppointmentStatus(
                appointmentId,
                status
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Status update failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        handleBookAppointment,
        handleGetPatientAppointments,
        handleGetDoctorAppointments,
        handleGetAppointmentById,
        handleCancelAppointment,
        handleUpdateAppointmentStatus,
        loading,
        error,
        clearError,
    };
}