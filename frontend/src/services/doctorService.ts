import { axiosInstance } from "@/lib/axios";

export async function getDoctors() {
    try {
        const res = await axiosInstance.get("/doctor");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Get Doctors failed" };
    }
}

export async function getDoctorById(doctorId) {
    try {
        const res = await axiosInstance.get(`/doctor/${doctorId}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Get doctor failed" };
    }
}

export async function getDoctorByUserId(doctorUserId) {
    try {
        const res = await axiosInstance.get(`/doctor/userId/${doctorUserId}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Get doctor failed" };
    }
}

export async function updateDoctor(doctorId, data) {
    try {
        const res = await axiosInstance.patch(`/doctor/${doctorId}`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Update doctor failed" };
    }
}