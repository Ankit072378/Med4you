import Appointment from "../models/Appointment.js";
import Queue from "../models/Queue.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Hospital from "../models/Hospital.js";

// Book Appointment
export const bookAppointment = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            hospitalId,
            appointmentDate,
            appointmentTime,
            reason,
            symptoms,
            paymentMethod,
        } = req.body;

        console.log("Booking appointment with data:", req.body);

        // Validate doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        // Validate hospital
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            });
        }

        // Get or create queue for the day
        const appointmentDay = new Date(appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        let queue = await Queue.findOne({
            doctorId,
            date: appointmentDay,
        });

        if (!queue) {
            queue = new Queue({
                doctorId,
                hospitalId,
                date: appointmentDay,
                totalPatients: 0,
                lastTokenNumber: 0,
            });
            await queue.save();
        }

        // Generate token number
        const tokenNumber = queue.lastTokenNumber + 1;

        // Create appointment
        const appointment = new Appointment({
            patientId,
            doctorId,
            hospitalId,
            appointmentDate,
            appointmentTime,
            tokenNumber,
            reason,
            symptoms: symptoms || [],
            consultationFee: doctor.fee,
            paymentMethod,
            paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
            status: "scheduled",
        });

        await appointment.save();

        // Update queue
        queue.totalPatients += 1;
        queue.lastTokenNumber = tokenNumber;
        queue.appointments.push({
            appointmentId: appointment._id,
            tokenNumber,
            status: "waiting", // Queue status
            joinedAt: null,
        });
        await queue.save();

        // Update doctor's appointment list
        if (!doctor.appointmentIds) {
            doctor.appointmentIds = [];
        }
        doctor.appointmentIds.push(appointment._id);
        await doctor.save();

        // Update hospital's appointment list
        const hospital = await Hospital.findById(hospitalId);
        if (hospital) {
            if (!hospital.appointmentIds) {
                hospital.appointmentIds = [];
            }
            hospital.appointmentIds.push(appointment._id);
            await hospital.save();
        }

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Book appointment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to book appointment",
            error: error.message,
        });
    }
};

// Get Patient Appointments 
export const getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status } = req.query;

        const filter = { patientId };
        if (status) {
            filter.status = status;
        }

        const appointments = await Appointment.find(filter)
            .populate("doctorId", "name type profilePhoto experience")
            .populate("hospitalId", "name city address")
            .sort({ appointmentDate: -1 });

        return res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error("Get patient appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            error: error.message,
        });
    }
};

// Get Doctor Appointments 
export const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, status, startDate, endDate } = req.query;

        console.log("\n=== GET DOCTOR APPOINTMENTS ===");
        console.log("Doctor ID:", doctorId);
        console.log("Query params:", { date, status, startDate, endDate });

        const filter = { doctorId };

        if (startDate && endDate) {
            const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
            const [eYear, eMonth, eDay] = endDate.split("-").map(Number);

            const rangeStart = new Date(
                Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0)
            );
            const rangeEnd = new Date(
                Date.UTC(eYear, eMonth - 1, eDay, 23, 59, 59, 999)
            );

            filter.appointmentDate = {
                $gte: rangeStart,
                $lte: rangeEnd,
            };

            console.log("Date range filter:", {
                startDate: rangeStart.toISOString(),
                endDate: rangeEnd.toISOString(),
            });
        } else if (date) {
            const [year, month, day] = date.split("-").map(Number);

            const startOfDay = new Date(
                Date.UTC(year, month - 1, day, 0, 0, 0, 0)
            );
            const endOfDay = new Date(
                Date.UTC(year, month - 1, day, 23, 59, 59, 999)
            );

            filter.appointmentDate = {
                $gte: startOfDay,
                $lte: endOfDay,
            };

            console.log("Single date filter:", {
                inputDate: date,
                startDate: startOfDay.toISOString(),
                endDate: endOfDay.toISOString(),
            });
        } else {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const thirtyDaysLater = new Date(now);
            thirtyDaysLater.setDate(now.getDate() + 30);
            thirtyDaysLater.setHours(23, 59, 59, 999);

            filter.appointmentDate = {
                $gte: now,
                $lte: thirtyDaysLater,
            };

            console.log("Default filter: Next 30 days from today");
        }

        if (status) {
            filter.status = status;
        }

        console.log("Filter being used:", JSON.stringify(filter, null, 2));

        const appointments = await Appointment.find(filter)
            .populate("patientId", "name age gender contact")
            .populate("hospitalId", "name city")
            .sort({ appointmentDate: 1, tokenNumber: 1 });

        console.log(`Found ${appointments.length} appointments`);

        if (appointments.length > 0) {
            console.log("Appointments found:");
            appointments.forEach((apt) => {
                console.log(
                    `  - Token ${apt.tokenNumber}: ${
                        apt.appointmentDate.toISOString().split("T")[0]
                    } at ${apt.appointmentTime}`
                );
            });
        }

        return res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error("Get doctor appointments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
            error: error.message,
        });
    }
};

// Get Appointment by ID 
export const getAppointmentById = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId)
            .populate("patientId", "name age gender contact bloodGroup")
            .populate(
                "doctorId",
                "name type profilePhoto qualifications experience fee"
            )
            .populate("hospitalId", "name city address contacts");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error("Get appointment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment",
            error: error.message,
        });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { reason, cancelledBy } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        if (
            appointment.status === "completed" ||
            appointment.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: `Appointment is already ${appointment.status}`,
            });
        }

        // Update appointment
        appointment.status = "cancelled";
        appointment.cancellationReason = reason;
        appointment.cancelledBy = cancelledBy || "patient";
        appointment.cancelledAt = new Date();
        await appointment.save();

        // Update queue
        const appointmentDay = new Date(appointment.appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDay,
        });

        if (queue) {
            const appointmentIndex = queue.appointments.findIndex(
                (a) => a.appointmentId.toString() === appointmentId
            );

            if (appointmentIndex !== -1) {
                // Remove from queue completely
                queue.appointments.splice(appointmentIndex, 1);
                queue.totalPatients = Math.max(0, queue.totalPatients - 1);

                // Only decrease waiting if it was waiting
                const queueAppointment = queue.appointments[appointmentIndex];
                if (queueAppointment && queueAppointment.status === "waiting") {
                    queue.waitingPatients = Math.max(
                        0,
                        queue.waitingPatients - 1
                    );
                }

                await queue.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Cancel appointment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel appointment",
            error: error.message,
        });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

        console.log("\n=== UPDATE APPOINTMENT STATUS ===");
        console.log("Appointment ID:", appointmentId);
        console.log("New Status:", status);

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        const oldStatus = appointment.status;
        console.log("Old Status:", oldStatus);
        
        appointment.status = status;

        // Update timing based on status
        if (status === "in_queue") {
            appointment.actualArrivalTime = appointment.actualArrivalTime || new Date();
        } else if (status === "in_consultation") {
            appointment.consultationStartTime = appointment.consultationStartTime || new Date();
        } else if (status === "completed") {
            appointment.consultationEndTime = appointment.consultationEndTime || new Date();
        }

        await appointment.save();
        console.log("✅ Appointment status updated");

        // Update queue status
        const appointmentDay = new Date(appointment.appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0);

        console.log("Looking for queue with:", {
            doctorId: appointment.doctorId,
            date: appointmentDay.toISOString(),
        });

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDay,
        });

        if (!queue) {
            console.log("⚠️ No queue found for this date");
            return res.status(200).json({
                success: true,
                message: "Appointment status updated (queue not found)",
                data: appointment,
            });
        }

        console.log("✅ Queue found:", queue._id);

        const queueAppointmentIndex = queue.appointments.findIndex(
            (a) => a.appointmentId.toString() === appointmentId
        );

        if (queueAppointmentIndex === -1) {
            console.log("⚠️ Appointment not found in queue, adding it now...");
            
            // Add to queue if not present
            queue.appointments.push({
                appointmentId: appointment._id,
                tokenNumber: appointment.tokenNumber,
                status: "waiting",
                joinedAt: status === "in_queue" ? new Date() : null,
            });
            
            if (status === "in_queue") {
                queue.waitingPatients += 1;
            }
            
            await queue.save();
            
            console.log("✅ Appointment added to queue");
            
            return res.status(200).json({
                success: true,
                message: "Appointment status updated and added to queue",
                data: appointment,
            });
        }

        const queueAppointment = queue.appointments[queueAppointmentIndex];
        const oldQueueStatus = queueAppointment.status;
        
        console.log("Queue appointment found at index:", queueAppointmentIndex);
        console.log("Old queue status:", oldQueueStatus);

        // Map appointment status to queue status
        let queueStatus = "waiting";
        let waitingChange = 0;

        switch (status) {
            case "scheduled":
                queueStatus = "waiting";
                break;
                
            case "in_queue":
                queueStatus = "waiting";
                if (!queueAppointment.joinedAt) {
                    queueAppointment.joinedAt = new Date();
                    console.log("✅ Set joinedAt timestamp");
                }
                // Only increment if previously not waiting
                if (oldQueueStatus !== "waiting") {
                    waitingChange = 1;
                }
                break;
                
            case "in_consultation":
                queueStatus = "in_consultation";
                if (!queueAppointment.calledAt) {
                    queueAppointment.calledAt = new Date();
                    console.log("✅ Set calledAt timestamp");
                }
                queue.currentPatient = appointmentId;
                queue.currentTokenNumber = appointment.tokenNumber;
                queue.doctorStatus = "busy";
                
                // Decrease waiting patients if was waiting
                if (oldQueueStatus === "waiting") {
                    waitingChange = -1;
                }
                break;
                
            case "completed":
                queueStatus = "completed";
                if (!queueAppointment.completedAt) {
                    queueAppointment.completedAt = new Date();
                    console.log("✅ Set completedAt timestamp");
                }
                queue.completedPatients += 1;
                
                // Clear current patient if this was it
                if (queue.currentPatient && queue.currentPatient.toString() === appointmentId) {
                    queue.currentPatient = null;
                    queue.doctorStatus = "available";
                    console.log("✅ Cleared current patient");
                }
                
                // Decrease waiting if was waiting
                if (oldQueueStatus === "waiting") {
                    waitingChange = -1;
                }
                break;
                
            case "cancelled":
                // Remove from queue
                queue.appointments.splice(queueAppointmentIndex, 1);
                queue.totalPatients = Math.max(0, queue.totalPatients - 1);
                
                if (oldQueueStatus === "waiting") {
                    waitingChange = -1;
                }
                
                await queue.save();
                console.log("✅ Removed from queue (cancelled)");
                
                return res.status(200).json({
                    success: true,
                    message: "Appointment cancelled and removed from queue",
                    data: appointment,
                });
                
            case "no_show":
                queueStatus = "skipped";
                if (oldQueueStatus === "waiting") {
                    waitingChange = -1;
                }
                break;
        }

        queueAppointment.status = queueStatus;
        queue.waitingPatients = Math.max(0, queue.waitingPatients + waitingChange);
        
        console.log("New queue status:", queueStatus);
        console.log("Waiting patients change:", waitingChange);
        console.log("New waiting patients count:", queue.waitingPatients);

        await queue.save();
        console.log("✅ Queue updated successfully");

        return res.status(200).json({
            success: true,
            message: "Appointment status updated",
            data: appointment,
        });
    } catch (error) {
        console.error("❌ Update appointment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};


// Complete Consultation (Add Medical Records)
export const completeConsultation = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const {
            diagnosis,
            prescription,
            testsRecommended,
            followUpDate,
            doctorNotes,
            medicalDocuments,
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        // Update appointment with medical records
        appointment.status = "completed";
        appointment.consultationEndTime =
            appointment.consultationEndTime || new Date();
        appointment.diagnosis = diagnosis;
        appointment.prescription = prescription;
        appointment.testsRecommended = testsRecommended || [];
        appointment.followUpDate = followUpDate;
        appointment.doctorNotes = doctorNotes;
        appointment.medicalDocuments = medicalDocuments || [];

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
                const queueAppointment =
                    queue.appointments[queueAppointmentIndex];
                queueAppointment.status = "completed";
                queueAppointment.completedAt = new Date();
            }

            queue.completedPatients += 1;

            // Clear current patient if this was it
            if (
                queue.currentPatient &&
                queue.currentPatient.toString() === appointmentId
            ) {
                queue.currentPatient = null;
                queue.doctorStatus = "available";
            }

            // Calculate average consultation time
            const completedAppointments = queue.appointments.filter(
                (a) => a.status === "completed" && a.completedAt && a.calledAt
            );

            if (completedAppointments.length > 0) {
                const totalTime = completedAppointments.reduce((sum, a) => {
                    return (
                        sum + (new Date(a.completedAt) - new Date(a.calledAt))
                    );
                }, 0);
                queue.averageConsultationTime = Math.round(
                    totalTime / completedAppointments.length / 60000
                );
            }

            await queue.save();
        }

        // Update patient's medical history
        const patient = await Patient.findById(appointment.patientId);
        if (patient) {
            if (!patient.medicalHistory) {
                patient.medicalHistory = [];
            }
            patient.medicalHistory.push({
                appointmentId: appointment._id,
                date: appointment.appointmentDate,
                doctorId: appointment.doctorId,
                hospitalId: appointment.hospitalId,
                problem: appointment.reason,
                diagnosis,
                prescription,
                tests: testsRecommended || [],
                outcome: "Consultation completed",
                documents: medicalDocuments || [],
            });
            await patient.save();
        }

        return res.status(200).json({
            success: true,
            message: "Consultation completed successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Complete consultation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to complete consultation",
            error: error.message,
        });
    }
};
