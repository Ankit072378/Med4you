import { useState } from "react";
import * as medicalRecordService from "@/services/medicalRecordService";

export function useMedicalRecordActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateMedicalRecord = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.createMedicalRecord(
                data
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to create medical record";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetPatientMedicalHistory = async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.getPatientMedicalHistory(patientId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to fetch medical history";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetProviderMedicalRecords = async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.getProviderMedicalRecords(patientId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch records";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetPatientMedicalHistoryForProvider = async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.getPatientMedicalHistoryForProvider(
                    patientId
                );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to fetch patient medical history";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetMedicalRecordById = async (recordId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.getMedicalRecordById(
                recordId
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to fetch record";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleRequestMedicalAccess = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.requestMedicalAccess(
                data
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to request access";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleRespondToAccessRequest = async (requestId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.respondToAccessRequest(
                requestId,
                data
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to respond to request";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetPatientAccessRequests = async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.getPatientAccessRequests(patientId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to fetch access requests";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeAccess = async (requestId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.revokeAccess(requestId);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || "Failed to revoke access";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetApprovedAccessList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.getApprovedAccessList();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to fetch approved access";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateMyMedicalHistory = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.createOrUpdateMyMedicalHistory(data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to save medical history";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleGetMyMedicalHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.getMyMedicalHistory();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || "Failed to fetch your medical history";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMedicalHistorySection = async (section, data) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.updateMedicalHistorySection(
                    section,
                    data
                );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.message || `Failed to update ${section}`;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicalHistoryItem = async (section, itemData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.addMedicalHistoryItem(
                section,
                itemData
            );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || `Failed to add item to ${section}`;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMedicalHistoryItem = async (section, itemId) => {
        setLoading(true);
        setError(null);
        try {
            const response =
                await medicalRecordService.deleteMedicalHistoryItem(
                    section,
                    itemId
                );
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.message || `Failed to delete item from ${section}`;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        handleCreateMedicalRecord,
        handleGetPatientMedicalHistory,
        handleGetPatientMedicalHistoryForProvider,
        handleGetProviderMedicalRecords,
        handleGetMedicalRecordById,
        handleRequestMedicalAccess,
        handleRespondToAccessRequest,
        handleGetPatientAccessRequests,
        handleRevokeAccess,
        handleGetApprovedAccessList,

        // New patient medical history handlers
        handleCreateOrUpdateMyMedicalHistory,
        handleGetMyMedicalHistory,
        handleUpdateMedicalHistorySection,
        handleAddMedicalHistoryItem,
        handleDeleteMedicalHistoryItem,

        loading,
        error,
        clearError,
    };
}
