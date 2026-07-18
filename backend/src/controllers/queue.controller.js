import Queue from "../models/Queue.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// Get Live Queue Status (unchanged)
// In queue.controller.js
export const getLiveQueue = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        let queryDate = new Date();
        if (date) {
            queryDate = new Date(date);
        }
        queryDate.setHours(0, 0, 0, 0);

        let queue = await Queue.findOne({
            doctorId,
            date: queryDate,
        }).populate({
            path: "appointments.appointmentId",
            select: "patientId tokenNumber status appointmentTime",
            populate: {
                path: "patientId",
                select: "name age gender",
            },
        });

        if (!queue) {
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found",
                });
            }

            if (!doctor.hospitals || doctor.hospitals.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Doctor is not associated with any hospital",
                });
            }

            // CREATE QUEUE AND POPULATE WITH TODAY'S APPOINTMENTS
            queue = new Queue({
                doctorId,
                hospitalId: doctor.hospitals[0],
                date: queryDate,
                isActive: true,
            });

            // FIND ALL TODAY'S APPOINTMENTS FOR THIS DOCTOR
            const todayAppointments = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: queryDate,
                    $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
                },
                status: { $in: ["scheduled", "in_queue", "in_consultation"] },
            }).sort({ tokenNumber: 1 });

            // ADD APPOINTMENTS TO QUEUE
            queue.appointments = todayAppointments.map((apt) => ({
                appointmentId: apt._id,
                tokenNumber: apt.tokenNumber,
                status: apt.status === "in_queue" ? "waiting" : 
                        apt.status === "in_consultation" ? "in_consultation" : "waiting",
                joinedAt: apt.actualArrivalTime || null,
            }));

            queue.totalPatients = todayAppointments.length;
            queue.lastTokenNumber = todayAppointments.length > 0 
                ? Math.max(...todayAppointments.map(a => a.tokenNumber)) 
                : 0;

            await queue.save();

            // Re-fetch with populated data
            queue = await Queue.findById(queue._id).populate({
                path: "appointments.appointmentId",
                select: "patientId tokenNumber status appointmentTime",
                populate: {
                    path: "patientId",
                    select: "name age gender",
                },
            });
        }

        // CALCULATE WAITING PATIENTS DYNAMICALLY
        const waitingCount = queue.appointments.filter(
            (a) => a.status === "waiting"
        ).length;
        
        queue.waitingPatients = waitingCount;
        await queue.save();

        return res.status(200).json({
            success: true,
            data: queue,
        });
    } catch (error) {
        console.error("Get live queue error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch queue",
            error: error.message,
        });
    }
};

// FIXED: Join Queue with proper status sync
export const joinQueue = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        // Get or create queue
        const appointmentDay = new Date(appointment.appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        let queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDay,
        });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found. Please create queue first.",
            });
        }

        // Update appointment status
        appointment.status = "in_queue";
        appointment.actualArrivalTime = new Date();
        await appointment.save();

        // Check if appointment already in queue
        const existingIndex = queue.appointments.findIndex(
            (a) => a.appointmentId.toString() === appointmentId
        );

        if (existingIndex !== -1) {
            // Update existing entry
            queue.appointments[existingIndex].status = "waiting";
            queue.appointments[existingIndex].joinedAt = new Date();
        } else {
            // Add new entry
            queue.appointments.push({
                appointmentId: appointment._id,
                tokenNumber: appointment.tokenNumber,
                status: "waiting",
                joinedAt: new Date(),
            });
        }

        // Recalculate waiting patients
        queue.waitingPatients = queue.appointments.filter(
            (a) => a.status === "waiting"
        ).length;

        await queue.save();

        return res.status(200).json({
            success: true,
            message: "Successfully joined queue",
            data: {
                queuePosition: existingIndex + 1,
                tokenNumber: appointment.tokenNumber,
                estimatedWaitTime:
                    queue.averageConsultationTime * queue.waitingPatients,
            },
        });
    } catch (error) {
        console.error("Join queue error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to join queue",
            error: error.message,
        });
    }
};


// Get Queue Position (unchanged - already good)
export const getQueuePosition = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        const appointmentDay = new Date(appointment.appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDay,
        });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found",
            });
        }

        const position = queue.appointments.findIndex(
            (a) =>
                a.appointmentId.toString() === appointmentId &&
                a.status === "waiting"
        );

        return res.status(200).json({
            success: true,
            data: {
                position: position === -1 ? null : position + 1,
                currentToken: queue.currentTokenNumber,
                yourToken: appointment.tokenNumber,
                patientsAhead: position === -1 ? 0 : position,
                estimatedWaitTime:
                    position === -1
                        ? 0
                        : position * queue.averageConsultationTime,
                doctorStatus: queue.doctorStatus,
            },
        });
    } catch (error) {
        console.error("Get queue position error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch position",
            error: error.message,
        });
    }
};

// FIXED: Call Next Patient with proper status sync
export const callNextPatient = async (req, res) => {
    try {
        const { queueId } = req.params;

        const queue = await Queue.findById(queueId).populate(
            "appointments.appointmentId"
        );

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found",
            });
        }

        // Find next waiting patient
        const nextPatientIndex = queue.appointments.findIndex(
            (a) => a.status === "waiting"
        );

        if (nextPatientIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "No patients waiting in queue",
            });
        }

        const nextAppointment = queue.appointments[nextPatientIndex];

        // Update previous patient if exists (mark as completed)
        if (queue.currentPatient) {
            const prevAppointment = await Appointment.findById(
                queue.currentPatient
            );
            if (
                prevAppointment &&
                prevAppointment.status === "in_consultation"
            ) {
                prevAppointment.status = "completed";
                prevAppointment.consultationEndTime = new Date();
                await prevAppointment.save();

                // Update in queue
                const prevIndex = queue.appointments.findIndex(
                    (a) =>
                        a.appointmentId.toString() ===
                        queue.currentPatient.toString()
                );
                if (prevIndex !== -1) {
                    queue.appointments[prevIndex].status = "completed";
                    queue.appointments[prevIndex].completedAt = new Date();
                }

                queue.completedPatients += 1;
            }
        }

        // Update next appointment
        const appointment = await Appointment.findById(
            nextAppointment.appointmentId
        );
        appointment.status = "in_consultation";
        appointment.consultationStartTime = new Date();
        await appointment.save();

        // Update queue
        nextAppointment.status = "in_consultation";
        nextAppointment.calledAt = new Date();
        queue.currentPatient = nextAppointment.appointmentId;
        queue.currentTokenNumber = appointment.tokenNumber;
        queue.waitingPatients = Math.max(0, queue.waitingPatients - 1);
        queue.doctorStatus = "busy";

        await queue.save();

        return res.status(200).json({
            success: true,
            message: "Next patient called",
            data: {
                appointment,
                tokenNumber: appointment.tokenNumber,
            },
        });
    } catch (error) {
        console.error("Call next patient error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to call next patient",
            error: error.message,
        });
    }
};

// Start Consultation (unchanged)
export const startConsultation = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        appointment.status = "in_consultation";
        appointment.consultationStartTime = new Date();
        await appointment.save();

        // Update queue
        const appointmentDay = new Date(appointment.appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDay,
        });

        if (queue) {
            const queueAppointmentIndex = queue.appointments.findIndex(
                (a) => a.appointmentId.toString() === appointmentId
            );

            if (queueAppointmentIndex !== -1) {
                queue.appointments[queueAppointmentIndex].status = "in_consultation";
                queue.appointments[queueAppointmentIndex].calledAt = new Date();
                
                // Decrease waiting patients
                if (queue.appointments[queueAppointmentIndex].status === "waiting") {
                    queue.waitingPatients = Math.max(0, queue.waitingPatients - 1);
                }
            }

            queue.doctorStatus = "busy";
            queue.currentPatient = appointmentId;
            queue.currentTokenNumber = appointment.tokenNumber;
            await queue.save();
        }

        return res.status(200).json({
            success: true,
            message: "Consultation started",
            data: appointment,
        });
    } catch (error) {
        console.error("Start consultation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to start consultation",
            error: error.message,
        });
    }
};

// REMOVED: completeConsultation (use the one in appointment controller)

// Update Doctor Status (unchanged)
export const updateDoctorStatus = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { status } = req.body;

        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found",
            });
        }

        queue.doctorStatus = status;

        if (status === "available" && !queue.queueStartTime) {
            queue.queueStartTime = new Date();
        } else if (status === "completed") {
            queue.queueEndTime = new Date();
            queue.isActive = false;
        }

        await queue.save();

        // Update doctor's current status
        const doctor = await Doctor.findById(queue.doctorId);
        if (doctor) {
            doctor.currentStatus =
                status === "available" ? "available" : "not_available";
            await doctor.save();
        }

        return res.status(200).json({
            success: true,
            message: "Doctor status updated",
            data: queue,
        });
    } catch (error) {
        console.error("Update doctor status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};

// Add Break (unchanged)
export const addBreak = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { startTime, endTime, reason } = req.body;

        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found",
            });
        }

        queue.breaks.push({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reason,
        });

        queue.doctorStatus = "on_break";
        await queue.save();

        return res.status(200).json({
            success: true,
            message: "Break added",
            data: queue,
        });
    } catch (error) {
        console.error("Add break error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add break",
            error: error.message,
        });
    }
};
