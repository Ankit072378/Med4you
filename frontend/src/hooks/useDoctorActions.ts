import { useState } from "react";
import * as doctorService from "@/services/doctorService";

export function useDoctorActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGetDoctors = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await doctorService.getDoctors();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Get doctors failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetDoctorById = async (doctorId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await doctorService.getDoctorById(doctorId);
            console.log(response);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Get doctor failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetDoctorByUserId = async (doctorUserId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await doctorService.getDoctorByUserId(doctorUserId);
            console.log(response);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Get doctor failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDoctor = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const { id, ...updateData } = data;
            const response = await doctorService.updateDoctor(id, updateData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Update doctor failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        handleGetDoctors,
        handleGetDoctorById,
        handleUpdateDoctor,
        handleGetDoctorByUserId,
        loading,
        error,
        clearError,
    };
}
