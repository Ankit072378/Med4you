import { axiosInstance } from "@/lib/axios";

export async function addDoctor(data) {
    try {
        const res = await axiosInstance.post("/hospital/addDoctor", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Add doctor failed" };
    }
}

export async function getHospitals() {
    try {
        const res = await axiosInstance.get("/hospital");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Get Hospital failed" };
    }
}

export async function getHospitalById(hospitalId) {
    try {
        const res = await axiosInstance.get(`/hospital/${hospitalId}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Get Hospital By Id failed" };
    }
}

export async function updateBed(data) {
    try {
        // Changed from GET to PUT
        const res = await axiosInstance.put(
            `/hospital/${data.hospitalId}/beds/${data.bedId}`,
            {
                status: data.status,
                reservationTime: data.reservationTime,
                expectedReleaseTime: data.expectedReleaseTime,
                notes: data.notes,
                patientId: data.patientId,
            }
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Update bed failed" };
    }
}
