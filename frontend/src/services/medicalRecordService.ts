import { axiosInstance } from "@/lib/axios";

// Create medical record
export async function createMedicalRecord(data) {
    try {
        const res = await axiosInstance.post("/medical-records/create", data);
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to create medical record",
            }
        );
    }
}

// Get patient's complete medical history
export async function getPatientMedicalHistory(patientId) {
    try {
        const res = await axiosInstance.get(
            `/medical-records/patient/${patientId}/history`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch medical history",
            }
        );
    }
}

// Get patient's medical history for doctors/hospitals with approved access
export async function getPatientMedicalHistoryForProvider(patientId) {
    try {
        const res = await axiosInstance.get(
            `/medical-records/patient/${patientId}/medical-history`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch patient medical history",
            }
        );
    }
}


// Get provider-specific records (doctor/hospital)
export async function getProviderMedicalRecords(patientId) {
    try {
        const res = await axiosInstance.get(
            `/medical-records/provider/${patientId}`
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch records" };
    }
}

// Get single medical record
export async function getMedicalRecordById(recordId) {
    try {
        const res = await axiosInstance.get(`/medical-records/${recordId}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch record" };
    }
}

// Request access to patient medical history
export async function requestMedicalAccess(data) {
    try {
        const res = await axiosInstance.post(
            "/medical-records/request-access",
            data
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to request access" };
    }
}

// Respond to access request (patient)
export async function respondToAccessRequest(requestId, data) {
    try {
        const res = await axiosInstance.put(
            `/medical-records/access-request/${requestId}/respond`,
            data
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to respond to request" }
        );
    }
}

// Get patient's access requests
export async function getPatientAccessRequests(patientId) {
    try {
        const res = await axiosInstance.get(
            `/medical-records/access-requests/${patientId}`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch access requests",
            }
        );
    }
}

// Revoke access
export async function revokeAccess(requestId) {
    try {
        const res = await axiosInstance.put(
            `/medical-records/access-request/${requestId}/revoke`
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to revoke access" };
    }
}

// Get approved access list (for providers to see who they can access)
export async function getApprovedAccessList() {
    try {
        const res = await axiosInstance.get("/medical-records/approved-access");
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch approved access",
            }
        );
    }
}

// Create or Update Patient's Own Medical History (Patient only)
export async function createOrUpdateMyMedicalHistory(data) {
    try {
        const res = await axiosInstance.post("/medical-records/my-history", data);
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to save medical history",
            }
        );
    }
}

// Get Patient's Own Medical History (Patient only)
export async function getMyMedicalHistory() {
    try {
        const res = await axiosInstance.get("/medical-records/my-history");
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to fetch your medical history",
            }
        );
    }
}

// Update specific section of medical history (Patient only)
export async function updateMedicalHistorySection(section, data) {
    try {
        const res = await axiosInstance.put(
            `/medical-records/my-history/${section}`,
            data
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: `Failed to update ${section}`,
            }
        );
    }
}

// Add single item to array section (Patient only)
export async function addMedicalHistoryItem(section, itemData) {
    try {
        const res = await axiosInstance.post(
            `/medical-records/my-history/${section}/add`,
            itemData
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: `Failed to add item to ${section}`,
            }
        );
    }
}

// Delete single item from array section (Patient only)
export async function deleteMedicalHistoryItem(section, itemId) {
    try {
        const res = await axiosInstance.delete(
            `/medical-records/my-history/${section}/${itemId}`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: `Failed to delete item from ${section}`,
            }
        );
    }
}