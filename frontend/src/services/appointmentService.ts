import {axiosInstance} from "@/lib/axios";

// Book Appointment
export async function bookAppointment(data) {
    try {
        const res = await axiosInstance.post("/appointment/book", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Appointment booking failed" };
    }
}

// Get Patient Appointments
export async function getPatientAppointments(patientId) {
    try {
        const res = await axiosInstance.get(
            `/appointment/patient/${patientId}`
        );
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch appointments" }
        );
    }
}

// Get Doctor Appointments with optional date range support
export async function getDoctorAppointments(doctorId, date, endDate = null) {
    try {
        let url = `/appointment/doctor/${doctorId}`;
        
        if (date && endDate) {
            // Date range query
            const formattedStart = date instanceof Date 
                ? date.toISOString().split('T')[0] 
                : date;
            const formattedEnd = endDate instanceof Date 
                ? endDate.toISOString().split('T')[0] 
                : endDate;
            
            url += `?startDate=${formattedStart}&endDate=${formattedEnd}`;
            console.log("📅 Fetching date range:", { startDate: formattedStart, endDate: formattedEnd });
        } else if (date) {
            // Single date query
            const formattedDate = date instanceof Date 
                ? date.toISOString().split('T')[0] 
                : date;
            
            url += `?date=${formattedDate}`;
            console.log("📅 Fetching single date:", formattedDate);
        } else {
            // No date = get all upcoming (next 30 days by default)
            console.log("📅 Fetching all upcoming appointments");
        }
        
        const res = await axiosInstance.get(url);
        
        console.log("✅ Appointments response:", {
            success: res.data.success,
            count: res.data.data?.length || 0
        });
        
        return res.data;
    } catch (error) {
        console.error("❌ Get appointments error:", error);
        throw (
            error.response?.data || { message: "Failed to fetch appointments" }
        );
    }
}




// Cancel Appointment
export async function cancelAppointment(appointmentId, reason) {
    try {
        const res = await axiosInstance.put(
            `/appointment/${appointmentId}/cancel`,
            {
                reason,
            }
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Cancellation failed" };
    }
}

// Update Appointment Status
export async function updateAppointmentStatus(appointmentId, status) {
    try {
        const res = await axiosInstance.put(
            `/appointment/${appointmentId}/status`,
            {
                status,
            }
        );
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Status update failed" };
    }
}

// Get Appointment Details
export async function getAppointmentById(appointmentId) {
    try {
        const res = await axiosInstance.get(`/appointment/${appointmentId}`);
        return res.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Failed to fetch appointment" }
        );
    }
}