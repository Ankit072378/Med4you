// hooks/useAdminActions.js
import { useState } from "react";
import * as adminService from "@/services/adminService";

export const useAdminActions = () => {
    const [loading, setLoading] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        const res = await adminService.getPendingVerifications();
        setLoading(false);
        return res;
    };
const approveUser = async (id) => {
    setLoading(true);
    const res = await adminService.verifyUser(id, "approved");
    setLoading(false);
    return res;
};


    return { fetchPending, approveUser, loading };
};