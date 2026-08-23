import { axiosInstance } from "@/lib/axios";

// Get Live Queue Status
export async function getLiveQueue(doctorId, date) {
    try {
        const res = await axiosInstance.get(
            `/queue/doctor/${doctorId}?date=${date}`
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch queue" };
    }
}

// Join Queue (Mark Patient as Arrived)
export async function joinQueue(appointmentId) {
    try {
        const res = await axiosInstance.post(`/queue/join`, { appointmentId });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to join queue" };
    }
}

// Get Queue Position
export async function getQueuePosition(appointmentId) {
    try {
        const res = await axiosInstance.get(`/queue/position/${appointmentId}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch position" };
    }
}

// Call Next Patient (Doctor/Staff)
export async function callNextPatient(queueId) {
    try {
        const res = await axiosInstance.post(`/queue/${queueId}/next`);
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to call next patient" }
        );
    }
}

// Mark Patient as In Consultation
export async function startConsultation(appointmentId) {
    try {
        const res = await axiosInstance.put(
            `/queue/consultation/start/${appointmentId}`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to start consultation" }
        );
    }
}

// Complete Consultation
export async function completeConsultation(appointmentId, data) {
    try {
        const res = await axiosInstance.put(
            `/queue/consultation/complete/${appointmentId}`,
            data
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Failed to complete consultation",
            }
        );
    }
}

export async function updateDoctorStatus(queueId, status) {
    try {
        const res = await axiosInstance.patch(`/queue/${queueId}/status`, {
            status,
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update status" };
    }
}
