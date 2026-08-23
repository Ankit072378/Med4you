import { axiosInstance } from "@/lib/axios";

export async function triggerEmergency(data) {
    try {
        const res = await axiosInstance.post("/emergency/trigger",data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Triggering Emergency failed" };
    }
}

export async function getUserNotifications() {
    try {
        const res = await axiosInstance.get("/emergency/my-notifications");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Getting User Notifications failed" };
    }
}

export async function getUnreadNotificationCount() {
    try {
        const res = await axiosInstance.get("/emergency/unread-count");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Getting Unread Notifications failed" };
    }
}


export async function markNotificationResolved(notificationId) {
    try {
        const res = await axiosInstance.patch(
            `/emergency/${notificationId}/resolve`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Marking Notifications failed",
            }
        );
    }
}