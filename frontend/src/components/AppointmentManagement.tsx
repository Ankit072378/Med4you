import { useState, useEffect } from "react";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Calendar as CalendarIcon,
    Clock,
    Phone,
    User,
    Loader2,
    Filter,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreHorizontal,
    FileText,
    DollarSign,
    Stethoscope,
} from "lucide-react";
import { format, addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppointmentManagement = ({
    doctorId,
    hospitalId,
    userRole = "doctor",
    onRefresh,
}) => {
    const {
        handleGetDoctorAppointments,
        handleUpdateAppointmentStatus,
        handleCancelAppointment,
    } = useAppointmentActions();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState("upcoming");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog states
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate, dateRange, doctorId]);

    const fetchAppointments = async () => {
        if (!doctorId) return;

        setLoading(true);
        let result;

        switch (dateRange) {
            case "upcoming": {
                result = await handleGetDoctorAppointments(
                    doctorId,
                    null,
                    null
                );
                break;
            }

            case "next7days": {
                const today = format(new Date(), "yyyy-MM-dd");
                const weekLater = format(addDays(new Date(), 7), "yyyy-MM-dd");

                result = await handleGetDoctorAppointments(
                    doctorId,
                    today,
                    weekLater
                );
                break;
            }

            case "today": {
                const todayDate = format(new Date(), "yyyy-MM-dd");

                result = await handleGetDoctorAppointments(
                    doctorId,
                    todayDate
                );
                break;
            }

            case "tomorrow": {
                const tomorrowDate = format(
                    addDays(new Date(), 1),
                    "yyyy-MM-dd"
                );

                result = await handleGetDoctorAppointments(
                    doctorId,
                    tomorrowDate
                );
                break;
            }

            case "custom": {
                const customDate = format(selectedDate, "yyyy-MM-dd");

                result = await handleGetDoctorAppointments(
                    doctorId,
                    customDate
                );
                break;
            }

            default: {
                result = await handleGetDoctorAppointments(
                    doctorId,
                    null,
                    null
                );
            }
        }

        if (result?.success) {
            setAppointments(result.data);
            console.log(
                `✅ Loaded ${result.data.length} appointments for ${dateRange}`
            );
        } else {
            toast.error("Failed to fetch appointments");
        }

        setLoading(false);
    };

    // NEW: Check if appointment date is today
    const isAppointmentToday = (appointmentDate) => {
        const today = startOfDay(new Date());
        const aptDate = startOfDay(new Date(appointmentDate));
        return isSameDay(aptDate, today);
    };

    // NEW: Check if appointment date is in the past
    const isAppointmentPast = (appointmentDate) => {
        const today = startOfDay(new Date());
        const aptDate = startOfDay(new Date(appointmentDate));
        return isBefore(aptDate, today);
    };

    // NEW: Check if status can be changed
    const canChangeStatus = (appointment) => {
        // Can't change if already completed or cancelled
        if (
            appointment.status === "completed" ||
            appointment.status === "cancelled"
        ) {
            return false;
        }

        // Can only change status for today's appointments
        if (!isAppointmentToday(appointment.appointmentDate)) {
            return false;
        }

        return true;
    };

    // NEW: Check if appointment can be cancelled
    const canCancelAppointment = (appointment) => {
        // Can't cancel if already completed or cancelled
        if (
            appointment.status === "completed" ||
            appointment.status === "cancelled"
        ) {
            return false;
        }

        // Can't cancel past appointments
        if (isAppointmentPast(appointment.appointmentDate)) {
            return false;
        }

        return true;
    };

    const handleStatusUpdate = async () => {
        if (!selectedAppointment || !newStatus) return;

        // UPDATED: Double-check if status can be changed
        if (!canChangeStatus(selectedAppointment)) {
            toast.error("Status can only be changed for today's appointments");
            return;
        }

        const result = await handleUpdateAppointmentStatus(
            selectedAppointment._id,
            newStatus
        );

        if (result.success) {
            toast.success("Appointment status updated");
            fetchAppointments();
            onRefresh?.();
            setStatusDialogOpen(false);
            setSelectedAppointment(null);
            setNewStatus("");
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    const handleCancelConfirm = async () => {
        if (!selectedAppointment || !cancelReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        // UPDATED: Double-check if can cancel
        if (!canCancelAppointment(selectedAppointment)) {
            toast.error("This appointment cannot be cancelled");
            return;
        }

        const result = await handleCancelAppointment(
            selectedAppointment._id,
            cancelReason
        );

        if (result.success) {
            toast.success("Appointment cancelled");
            fetchAppointments();
            onRefresh?.();
            setCancelDialogOpen(false);
            setSelectedAppointment(null);
            setCancelReason("");
        } else {
            toast.error(result.error || "Failed to cancel appointment");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: "secondary",
            in_queue: "default",
            in_consultation: "default",
            completed: "default",
            cancelled: "destructive",
            no_show: "destructive",
        };
        return colors[status] || "secondary";
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-3 w-3" />;
            case "cancelled":
            case "no_show":
                return <XCircle className="h-3 w-3" />;
            case "in_consultation":
                return <AlertCircle className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const getPaymentStatusColor = (status) => {
        return status === "paid"
            ? "default"
            : status === "refunded"
            ? "secondary"
            : "outline";
    };

    // Filter appointments
    const filteredAppointments = appointments.filter((appointment) => {
        const matchesStatus =
            statusFilter === "all" || appointment.status === statusFilter;
        const matchesSearch =
            searchQuery === "" ||
            appointment.patientId?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            appointment.tokenNumber?.toString().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // Quick date ranges
    const quickRanges = [
        { label: "All Upcoming", value: "upcoming" },
        { label: "Next 7 Days", value: "next7days" },
        { label: "Today", value: "today" },
        { label: "Tomorrow", value: "tomorrow" },
        { label: "Custom Date", value: "custom" },
    ];

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return format(new Date(dateString), "PPP");
    };

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    Appointment Management
                </h3>
                <p className="text-sm text-muted-foreground">
                    View and manage appointments across different dates
                </p>
            </div>
            {/* Filters */}
            <div className="space-y-4 mb-6">
                {/* Date Range Selector */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Label className="text-sm font-medium">Date Range:</Label>
                    <div className="flex gap-2">
                        {quickRanges.map((range) => (
                            <Button
                                key={range.value}
                                variant={
                                    dateRange === range.value
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setDateRange(range.value)}>
                                {range.label}
                            </Button>
                        ))}
                    </div>

                    {/* Date Picker for Custom */}
                    {dateRange === "custom" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Status and Search Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Search by patient name or token..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_queue">In Queue</SelectItem>
                            <SelectItem value="in_consultation">
                                In Consultation
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                    </Select>
                    {(searchQuery || statusFilter !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                            }}>
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
            {/* Appointments List */}
            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Loading appointments...
                    </p>
                </div>
            ) : filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                    {filteredAppointments.map((appointment) => {
                        // NEW: Calculate date-based permissions
                        const isToday = isAppointmentToday(
                            appointment.appointmentDate
                        );
                        const isPast = isAppointmentPast(
                            appointment.appointmentDate
                        );
                        const canUpdate = canChangeStatus(appointment);
                        const canCancel = canCancelAppointment(appointment);

                        return (
                            <Card
                                key={appointment._id}
                                className="p-4 hover:border-primary/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg font-bold text-primary">
                                                {appointment.tokenNumber}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <p className="font-medium text-foreground">
                                                    {appointment.patientId
                                                        ?.name || "Patient"}
                                                </p>
                                                <Badge
                                                    variant={getStatusColor(
                                                        appointment.status
                                                    )}
                                                    className="flex items-center gap-1">
                                                    {getStatusIcon(
                                                        appointment.status
                                                    )}
                                                    {appointment.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </Badge>
                                                <Badge
                                                    variant={getPaymentStatusColor(
                                                        appointment.paymentStatus
                                                    )}
                                                    className="text-xs">
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    {appointment.paymentStatus}
                                                </Badge>
                                                {/* NEW: Date-based badge */}
                                                {!isToday && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs">
                                                        {isPast
                                                            ? "Past"
                                                            : "Upcoming"}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p className="flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {formatDate(
                                                        appointment.appointmentDate
                                                    )}{" "}
                                                    •{" "}
                                                    {formatTime(
                                                        appointment.appointmentTime
                                                    )}
                                                </p>
                                                <p className="truncate">
                                                    <span className="font-medium">
                                                        Reason:
                                                    </span>{" "}
                                                    {appointment.reason}
                                                </p>
                                                {appointment.consultationFee && (
                                                    <p>
                                                        <span className="font-medium">
                                                            Fee:
                                                        </span>{" "}
                                                        ₹
                                                        {
                                                            appointment.consultationFee
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {appointment.patientId?.contact
                                            ?.phone && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    (window.location.href = `tel:${appointment.patientId.contact.phone}`)
                                                }>
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedAppointment(
                                                            appointment
                                                        );
                                                        setDetailsDialogOpen(
                                                            true
                                                        );
                                                    }}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {/* UPDATED: Only show Update Status for today's appointments */}
                                                {canUpdate && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedAppointment(
                                                                appointment
                                                            );
                                                            setStatusDialogOpen(
                                                                true
                                                            );
                                                        }}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Update Status
                                                    </DropdownMenuItem>
                                                )}
                                                {/* UPDATED: Only show Cancel for non-past appointments */}
                                                {canCancel && (
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedAppointment(
                                                                appointment
                                                            );
                                                            setCancelDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="text-destructive">
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel Appointment
                                                    </DropdownMenuItem>
                                                )}
                                                {/* NEW: Show reason when actions are disabled */}
                                                {!canUpdate && !canCancel && (
                                                    <DropdownMenuItem disabled>
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        {isPast
                                                            ? "Past appointment"
                                                            : "No actions available"}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">
                        No appointments found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {statusFilter !== "all" || searchQuery
                            ? "Try adjusting your filters"
                            : "No appointments scheduled for this date"}
                    </p>
                </div>
            )}
            {/* Update Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Appointment Status</DialogTitle>
                        <DialogDescription>
                            Change the status of this appointment (only
                            available for today's appointments)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Status</Label>
                            <Badge
                                variant={getStatusColor(
                                    selectedAppointment?.status
                                )}>
                                {selectedAppointment?.status?.replace("_", " ")}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select
                                value={newStatus}
                                onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">
                                        Scheduled
                                    </SelectItem>
                                    <SelectItem value="in_queue">
                                        In Queue
                                    </SelectItem>
                                    <SelectItem value="in_consultation">
                                        In Consultation
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="no_show">
                                        No Show
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStatusDialogOpen(false);
                                setSelectedAppointment(null);
                                setNewStatus("");
                            }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            disabled={!newStatus}>
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Cancel Appointment Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancellation. This will
                            be recorded in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Cancellation Reason</Label>
                            <Textarea
                                placeholder="Enter reason for cancellation..."
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelDialogOpen(false);
                                setSelectedAppointment(null);
                                setCancelReason("");
                            }}>
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelConfirm}
                            disabled={!cancelReason.trim()}>
                            Cancel Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Appointment Details Dialog - Keep the same as original */}
            <Dialog
                open={detailsDialogOpen}
                onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                        <div className="space-y-6 py-4">
                            {/* Basic Info */}
                            <div>
                                <h4 className="font-semibold mb-3">
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Token Number
                                        </Label>
                                        <p className="font-medium">
                                            #{selectedAppointment.tokenNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Status
                                        </Label>
                                        <div className="mt-1">
                                            <Badge
                                                variant={getStatusColor(
                                                    selectedAppointment.status
                                                )}>
                                                {selectedAppointment.status.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Patient Name
                                        </Label>
                                        <p className="font-medium">
                                            {
                                                selectedAppointment.patientId
                                                    ?.name
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Contact
                                        </Label>
                                        <p className="font-medium">
                                            {selectedAppointment.patientId
                                                ?.contact?.phone || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Date
                                        </Label>
                                        <p className="font-medium">
                                            {formatDate(
                                                selectedAppointment.appointmentDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Time
                                        </Label>
                                        <p className="font-medium">
                                            {formatTime(
                                                selectedAppointment.appointmentTime
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div>
                                <h4 className="font-semibold mb-3">
                                    Medical Information
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Reason for Visit
                                        </Label>
                                        <p className="font-medium">
                                            {selectedAppointment.reason}
                                        </p>
                                    </div>
                                    {selectedAppointment.symptoms &&
                                        selectedAppointment.symptoms.length >
                                            0 && (
                                            <div>
                                                <Label className="text-muted-foreground">
                                                    Symptoms
                                                </Label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedAppointment.symptoms.map(
                                                        (symptom, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline">
                                                                {symptom}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    {selectedAppointment.diagnosis && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Diagnosis
                                            </Label>
                                            <p className="font-medium">
                                                {selectedAppointment.diagnosis}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.prescription && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Prescription
                                            </Label>
                                            <p className="font-medium">
                                                {
                                                    selectedAppointment.prescription
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div>
                                <h4 className="font-semibold mb-3">
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Consultation Fee
                                        </Label>
                                        <p className="font-medium text-lg">
                                            ₹
                                            {
                                                selectedAppointment.consultationFee
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Payment Status
                                        </Label>
                                        <div className="mt-1">
                                            <Badge
                                                variant={getPaymentStatusColor(
                                                    selectedAppointment.paymentStatus
                                                )}>
                                                {
                                                    selectedAppointment.paymentStatus
                                                }
                                            </Badge>
                                        </div>
                                    </div>
                                    {selectedAppointment.paymentMethod && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Payment Method
                                            </Label>
                                            <p className="font-medium">
                                                {
                                                    selectedAppointment.paymentMethod
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.transactionId && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Transaction ID
                                            </Label>
                                            <p className="font-medium text-xs">
                                                {
                                                    selectedAppointment.transactionId
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {(selectedAppointment.patientNotes ||
                                selectedAppointment.doctorNotes) && (
                                <div>
                                    <h4 className="font-semibold mb-3">
                                        Notes
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedAppointment.patientNotes && (
                                            <div>
                                                <Label className="text-muted-foreground">
                                                    Patient Notes
                                                </Label>
                                                <p className="font-medium">
                                                    {
                                                        selectedAppointment.patientNotes
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {selectedAppointment.doctorNotes && (
                                            <div>
                                                <Label className="text-muted-foreground">
                                                    Doctor Notes
                                                </Label>
                                                <p className="font-medium">
                                                    {
                                                        selectedAppointment.doctorNotes
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cancellation Info */}
                            {selectedAppointment.status === "cancelled" &&
                                selectedAppointment.cancellationReason && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-destructive">
                                            Cancellation Details
                                        </h4>
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-muted-foreground">
                                                    Reason
                                                </Label>
                                                <p className="font-medium">
                                                    {
                                                        selectedAppointment.cancellationReason
                                                    }
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-muted-foreground">
                                                        Cancelled By
                                                    </Label>
                                                    <p className="font-medium">
                                                        {
                                                            selectedAppointment.cancelledBy
                                                        }
                                                    </p>
                                                </div>
                                                {selectedAppointment.cancelledAt && (
                                                    <div>
                                                        <Label className="text-muted-foreground">
                                                            Cancelled At
                                                        </Label>
                                                        <p className="font-medium">
                                                            {formatDate(
                                                                selectedAppointment.cancelledAt
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDetailsDialogOpen(false);
                                setSelectedAppointment(null);
                            }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
        </Card>
    );
};

export default AppointmentManagement;


