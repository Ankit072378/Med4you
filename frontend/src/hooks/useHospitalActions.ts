import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import * as hospitalService from "@/services/hospitalService";
import * as authService from "@/services/authService";

export function useHospitalActions() {
    const { setUser, setProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add Doctor (Only Hospitals)
    const handleAddDoctor = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const response = await hospitalService.addDoctor(data);

            if (response.success) {
                const userResponse = await authService.me();

                setUser(userResponse.data.user);
                setProfile(userResponse.data.profile);

                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.message || "Add doctor failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get all hospitals
    const handleGetHospitals = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await hospitalService.getHospitals();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Get Hospitals failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get Hospital by ID
    const handleGetHospitalById = async (hospitalId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await hospitalService.getHospitalById(hospitalId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Get Hospital by ID failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Update Bed (mark available/occupied/reserved, etc.)
    const handleUpdateBed = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const response = await hospitalService.updateBed(data);

            // Refresh hospital data after booking
            if (response.success) {
                return { success: true, data: response.data };
            }

            return { success: false, error: "Update failed" };
        } catch (err) {
            const errorMessage = err.message || "Update bed failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };


    const clearError = () => setError(null);

    return {
        // actions
        handleAddDoctor,
        handleGetHospitals,
        handleGetHospitalById,
        handleUpdateBed, // <--- added here

        // state
        loading,
        error,

        // helpers
        clearError,
    };
}