import { axiosInstance } from "@/lib/axios";

export const getPendingVerifications = async () => {
    const res = await axiosInstance.get("/admin/pending-verifications");
    return res.data;
};

export const verifyUser = async (userId, status = "approved") => {
    const res = await axiosInstance.put(
        `/admin/verify-user/${userId}`,
        { status }, // 🔥 send body
        { withCredentials: true } // send jwt cookie
    );
    return res.data;
};
