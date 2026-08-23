import { useState } from "react";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const AppointmentBookingModal = ({ isOpen, onClose, doctor, hospitalId }) => {
    const { handleBookAppointment, loading } = useAppointmentActions();
    const { user, profile } = useAuth();

    const [formData, setFormData] = useState({
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        symptoms: "",
        paymentMethod: "cash",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to book an appointment");
            return;
        }

        const appointmentData = {
            patientId: profile._id,
            doctorId: doctor._id,
            hospitalId: hospitalId || doctor.hospitals[0],
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            reason: formData.reason,
            symptoms: formData.symptoms.split(",").map((s) => s.trim()),
            paymentMethod: formData.paymentMethod,
        };

        const result = await handleBookAppointment(appointmentData);

        if (result.success) {
            toast.success("Appointment booked successfully!");
            onClose();
            setFormData({
                appointmentDate: "",
                appointmentTime: "",
                reason: "",
                symptoms: "",
                paymentMethod: "cash",
            });
        } else {
            toast.error(result.error || "Failed to book appointment");
        }
    };

    // Get tomorrow's date as minimum
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a consultation with Dr. {doctor.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Doctor Fee Display */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Consultation Fee
                            </span>
                            <div className="flex items-baseline gap-1">
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-xl font-bold text-primary">
                                    {doctor.fee}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="appointmentDate" className="text-sm">
                            Appointment Date *
                        </Label>
                        <Input
                            id="appointmentDate"
                            name="appointmentDate"
                            type="date"
                            value={formData.appointmentDate}
                            onChange={handleInputChange}
                            min={minDate}
                            required
                            className="mt-1"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <Label htmlFor="appointmentTime" className="text-sm">
                            Preferred Time *
                        </Label>
                        <Input
                            id="appointmentTime"
                            name="appointmentTime"
                            type="time"
                            value={formData.appointmentTime}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <Label htmlFor="reason" className="text-sm">
                            Reason for Visit *
                        </Label>
                        <Input
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="e.g., Regular checkup, Fever, etc."
                            required
                            className="mt-1"
                        />
                    </div>

                    {/* Symptoms */}
                    <div>
                        <Label htmlFor="symptoms" className="text-sm">
                            Symptoms (comma separated)
                        </Label>
                        <Textarea
                            id="symptoms"
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            placeholder="e.g., Headache, Fever, Cough"
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <Label htmlFor="paymentMethod" className="text-sm">
                            Payment Method *
                        </Label>
                        <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                            required>
                            <option value="cash">Cash (Pay at Hospital)</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="insurance">Insurance</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Confirm Booking
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentBookingModal;
