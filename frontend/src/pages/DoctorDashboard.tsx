import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import { useQueueActions } from "@/hooks/useQueueActions";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import Navbar from "@/components/Navbar";
import AppointmentManagement from "@/components/AppointmentManagement";
import MedicalRecordForm from "@/components/MedicalRecordForm";
import MedicalHistoryViewer from "@/components/MedicalHistoryViewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Calendar,
    Clock,
    Users,
    Activity,
    CheckCircle,
    Phone,
    Loader2,
    FileText,
    Search,
    ChevronRight,
    CalendarDays,
    User,
    X,
    Eye,
    Send,
    Camera,
    Upload,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ProviderPatientMedicalHistoryViewer from "@/components/ProviderPatientMedicalHistoryViewer";

const DoctorDashboard = () => {
    const { user, profile } = useAuth();
    const { handleProfilePhotoUpload, loading: uploadLoading } =
        useAuthActions();
    const { handleGetDoctorAppointments } = useAppointmentActions();
    const {
        handleGetLiveQueue,
        handleCallNextPatient,
        handleUpdateDoctorStatus,
    } = useQueueActions();
    const { handleUpdateDoctor } = useDoctorActions();
    const {
        handleCreateMedicalRecord,
        handleRequestMedicalAccess,
        handleGetApprovedAccessList,
    } = useMedicalRecordActions();

    const fileInputRef = useRef(null);

    const [appointments, setAppointments] = useState([]);
    const [queue, setQueue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState(
        profile?.currentStatus === "available"
    );
    const [activeTab, setActiveTab] = useState("queue");

    // Medical Records State
    const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchPatientPhone, setSearchPatientPhone] = useState("");
    const [approvedPatients, setApprovedPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [requesting, setRequesting] = useState(false);

    // Photo Upload State
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPhotoDialog, setShowPhotoDialog] = useState(false);

    // Fetch today's appointments and queue
    useEffect(() => {
        if (profile?._id) {
            fetchDashboardData();
            fetchApprovedPatients();
        }
    }, [profile]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const todayDate = format(new Date(), "yyyy-MM-dd");

        // Fetch appointments
        const appointmentsResult = await handleGetDoctorAppointments(
            profile._id,
            todayDate
        );
        if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data);
        }

        // Fetch queue
        await fetchQueue();
        setLoading(false);
    };

    const fetchQueue = async () => {
        const today = new Date().toISOString().split("T")[0];
        const queueResult = await handleGetLiveQueue(profile._id, today);
        if (queueResult.success) {
            setQueue(queueResult.data);
        }
    };

    const fetchApprovedPatients = async () => {
        const result = await handleGetApprovedAccessList();
        if (result.success) {
            setApprovedPatients(result.data);
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setSelectedFile(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
            setShowPhotoDialog(true);
        };
        reader.readAsDataURL(file);
    };

    // Upload/Update photo
    const handlePhotoUpload = async () => {
        if (!selectedFile) return;

        const result = await handleProfilePhotoUpload(selectedFile);
        if (result.success) {
            toast.success("Profile photo updated successfully!");
            setShowPhotoDialog(false);
            setPhotoPreview(null);
            setSelectedFile(null);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
            toast.error(result.error || "Failed to update profile photo");
        }
    };

    // Cancel photo selection
    const handleCancelPhotoUpload = () => {
        setShowPhotoDialog(false);
        setPhotoPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Trigger file input
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Toggle availability
    // In DoctorDashboard
    // In DoctorDashboard - handleAvailabilityToggle
    const handleAvailabilityToggle = async (checked) => {
        const newStatus = checked ? "available" : "not_available";

        // ADD THESE DEBUG LOGS FIRST
        console.log("Profile:", profile);
        console.log("Profile ID:", profile?.id);
        console.log("Profile _id:", profile?._id);

        const result = await handleUpdateDoctor({
            id: profile._id || profile.id, // TRY _id FIRST
            currentStatus: newStatus,
        });

        if (result.success) {
            setIsAvailable(checked);
            toast.success(
                checked
                    ? "You are now available for consultation"
                    : "You are now unavailable"
            );

            if (queue) {
                await handleUpdateDoctorStatus(
                    queue.id,
                    checked ? "available" : "notarrived"
                );
                await fetchQueue();
            }
        } else {
            toast.error("Failed to update availability");
        }
    };

    // Call next patient
    const handleNextPatient = async () => {
        if (!queue) return;

        setQueueLoading(true);
        const result = await handleCallNextPatient(queue._id);
        if (result.success) {
            toast.success(`Token ${result.data.tokenNumber} called`);
            await fetchQueue();
            await fetchDashboardData();
        } else {
            toast.error(result.error || "Failed to call next patient");
        }
        setQueueLoading(false);
    };

    // Complete consultation and create medical record
    const handleCompleteConsultation = (appointment) => {
        setSelectedAppointment(appointment);
        setShowMedicalRecordForm(true);
    };

    const handleSaveMedicalRecord = async (recordData) => {
        const result = await handleCreateMedicalRecord({
            ...recordData,
            patientId:
                selectedAppointment.patientId._id ||
                selectedAppointment.patientId,
            appointmentId: selectedAppointment._id,
            visitType: "consultation",
            visitDate: new Date(),
        });

        if (result.success) {
            toast.success("Medical record created successfully");
            setShowMedicalRecordForm(false);
            setSelectedAppointment(null);
            await fetchDashboardData();
        } else {
            toast.error(result.error || "Failed to create medical record");
        }
    };

    // Request patient access
    const handleRequestPatientAccess = async (patientId) => {
        setRequesting(true);
        const result = await handleRequestMedicalAccess({
            patientId: patientId,
            purpose: "Medical consultation and treatment planning",
            accessLevel: "read_only",
        });

        if (result.success) {
            toast.success("Access request sent to patient");
            setTimeout(fetchApprovedPatients, 1000);
        } else {
            toast.error(result.error || "Failed to send access request");
        }
        setRequesting(false);
    };

    const getInitials = (name) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Statistics
    const todayStats = {
        total: appointments.length,
        completed: appointments.filter((a) => a.status === "completed").length,
        inQueue: appointments.filter((a) => a.status === "inqueue").length,
        scheduled: appointments.filter((a) => a.status === "scheduled").length,
        inConsultation: appointments.filter(
            (a) => a.status === "inconsultation"
        ).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-24 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Loading dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        Doctor Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome back, {profile?.name}
                    </p>
                </div>

                {/* Doctor Profile Card with Photo Upload */}
                <Card className="p-6 mb-6 border-l-4 border-l-primary">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar with Upload Capability */}
                            <div className="relative group">
                                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                    <AvatarImage
                                        src={profile?.profilePhoto}
                                        alt={profile?.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
                                        {getInitials(profile?.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Photo Edit Overlay */}
                                <button
                                    onClick={triggerFileInput}
                                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    title={
                                        profile?.profilePhoto
                                            ? "Change Photo"
                                            : "Upload Photo"
                                    }>
                                    <Camera className="h-5 w-5 text-white" />
                                </button>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {profile?.name}
                                </h2>
                                <Badge variant="secondary" className="mt-1">
                                    {profile?.type}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {profile?.experience} years experience
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Label
                                htmlFor="availability"
                                className="text-sm font-medium">
                                Available for Consultation
                            </Label>
                            <Switch
                                id="availability"
                                checked={isAvailable}
                                onCheckedChange={handleAvailabilityToggle}
                            />
                        </div>
                    </div>
                </Card>

                {/* Photo Upload Dialog */}
                <Dialog
                    open={showPhotoDialog}
                    onOpenChange={setShowPhotoDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {profile?.profilePhoto
                                    ? "Update Profile Photo"
                                    : "Upload Profile Photo"}
                            </DialogTitle>
                            <DialogDescription>
                                Preview your new profile photo before uploading.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center gap-4 py-4">
                            {photoPreview && (
                                <div className="relative">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-40 h-40 rounded-full object-cover border-4 border-background shadow-lg"
                                    />
                                    {uploadLoading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground text-center">
                                This photo will be visible to patients and
                                hospitals.
                            </p>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={handleCancelPhotoUpload}
                                disabled={uploadLoading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePhotoUpload}
                                disabled={uploadLoading}>
                                {uploadLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Total Today
                            </p>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                            {todayStats.total}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {todayStats.scheduled} scheduled
                        </p>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                In Queue
                            </p>
                            <Users className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-500">
                            {queue?.waitingPatients || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            waiting patients
                        </p>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>
                            <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        <p className="text-3xl font-bold text-success">
                            {todayStats.completed}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            consultations done
                        </p>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Current Token
                            </p>
                            <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-primary">
                            {queue?.currentTokenNumber || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            now serving
                        </p>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                            value="queue"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Users className="h-4 w-4 mr-2" />
                            Queue Management
                            {queue?.waitingPatients > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {queue.waitingPatients}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="today"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Calendar className="h-4 w-4 mr-2" />
                            Today's Appointments
                        </TabsTrigger>
                        <TabsTrigger
                            value="manage"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Manage Appointments
                        </TabsTrigger>
                        <TabsTrigger
                            value="patient-access"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Search className="h-4 w-4 mr-2" />
                            Patient Records
                        </TabsTrigger>
                    </TabsList>

                    {/* Queue Management Tab */}
                    <TabsContent value="queue" className="space-y-4">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        Today's Queue
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Manage patient consultations
                                    </p>
                                </div>

                                {queue?.waitingPatients > 0 && (
                                    <Button
                                        onClick={handleNextPatient}
                                        disabled={queueLoading}
                                        size="lg">
                                        {queueLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Calling...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronRight className="h-4 w-4 mr-2" />
                                                Call Next Patient
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Current Patient */}
                            {queue?.currentPatient && (
                                <Card className="p-5 mb-6 bg-primary/5 border-primary/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="default">
                                            In Consultation
                                        </Badge>
                                        <Badge variant="outline">
                                            Token #{queue.currentTokenNumber}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Currently consulting with patient
                                    </p>
                                </Card>
                            )}

                            {/* Queue List */}
                            {queue?.appointments &&
                            queue.appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {queue.appointments
                                        .filter(
                                            (item) =>
                                                item.status === "waiting" ||
                                                item.status === "called"
                                        )
                                        .map((item, index) => (
                                            <Card
                                                key={item._id || index}
                                                className="p-4 hover:border-primary/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xl font-bold text-primary">
                                                                {
                                                                    item.tokenNumber
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                Token #
                                                                {
                                                                    item.tokenNumber
                                                                }
                                                            </p>
                                                            {item.joinedAt && (
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    Arrived at{" "}
                                                                    {new Date(
                                                                        item.joinedAt
                                                                    ).toLocaleTimeString(
                                                                        "en-IN",
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            "waiting"
                                                                ? "secondary"
                                                                : "default"
                                                        }>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-muted-foreground font-medium mb-1">
                                        No patients in queue
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Queue is currently empty
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Today's Appointments Tab */}
                    <TabsContent value="today" className="space-y-4">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Today's Appointments
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                All scheduled appointments for today
                            </p>

                            {appointments.length > 0 ? (
                                <div className="space-y-3">
                                    {appointments.map((appointment) => (
                                        <Card
                                            key={appointment._id}
                                            className="p-4 hover:border-primary/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg font-bold text-primary">
                                                            {
                                                                appointment.tokenNumber
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <p className="font-medium text-foreground">
                                                                {appointment
                                                                    .patientId
                                                                    ?.name ||
                                                                    "Patient"}
                                                            </p>
                                                            <Badge
                                                                variant={
                                                                    appointment.status ===
                                                                    "completed"
                                                                        ? "default"
                                                                        : appointment.status ===
                                                                          "in_consultation"
                                                                        ? "default"
                                                                        : appointment.status ===
                                                                          "cancelled"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }>
                                                                {appointment.status.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </Badge>
                                                            {appointment.paymentStatus && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs">
                                                                    {
                                                                        appointment.paymentStatus
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 text-sm text-muted-foreground">
                                                            <p className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(
                                                                    appointment.appointmentTime
                                                                )}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">
                                                                    Reason:
                                                                </span>{" "}
                                                                {
                                                                    appointment.reason
                                                                }
                                                            </p>
                                                            {appointment.symptoms &&
                                                                appointment
                                                                    .symptoms
                                                                    .length >
                                                                    0 && (
                                                                    <p>
                                                                        <span className="font-medium">
                                                                            Symptoms:
                                                                        </span>{" "}
                                                                        {appointment.symptoms.join(
                                                                            ", "
                                                                        )}
                                                                    </p>
                                                                )}
                                                            {appointment.actualArrivalTime && (
                                                                <p className="flex items-center gap-1 text-xs">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Arrived at{" "}
                                                                    {new Date(
                                                                        appointment.actualArrivalTime
                                                                    ).toLocaleTimeString(
                                                                        "en-IN",
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {appointment.patientId
                                                        ?.contact?.phone && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                (window.location.href = `tel:${appointment.patientId.contact.phone}`)
                                                            }>
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {appointment.status ===
                                                        "in_consultation" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleCompleteConsultation(
                                                                    appointment
                                                                )
                                                            }>
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-muted-foreground font-medium mb-1">
                                        No appointments today
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Your schedule is clear
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Manage Appointments Tab */}
                    <TabsContent value="manage" className="space-y-4">
                        <AppointmentManagement
                            doctorId={profile?._id}
                            hospitalId={profile?.hospitalId}
                            userRole="doctor"
                            onRefresh={fetchDashboardData}
                        />
                    </TabsContent>

                    {/* Patient Access Tab */}
                    {/* Patient Access Tab */}
                    <TabsContent value="patient-access" className="space-y-4">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Patient Medical Records Access
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                View medical records of patients who have
                                granted you access and track your access
                                requests
                            </p>

                            {/* 🆕 TABS FOR DIFFERENT REQUEST STATUSES */}
                            <Tabs defaultValue="approved" className="mb-6">
                                <TabsList>
                                    <TabsTrigger value="approved">
                                        Approved
                                        <Badge
                                            variant="default"
                                            className="ml-2">
                                            {
                                                approvedPatients.filter(
                                                    (r) =>
                                                        r.status === "approved"
                                                ).length
                                            }
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="pending">
                                        Pending
                                        <Badge
                                            variant="secondary"
                                            className="ml-2">
                                            {
                                                approvedPatients.filter(
                                                    (r) =>
                                                        r.status === "pending"
                                                ).length
                                            }
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="rejected">
                                        Rejected
                                        <Badge
                                            variant="destructive"
                                            className="ml-2">
                                            {
                                                approvedPatients.filter(
                                                    (r) =>
                                                        r.status === "rejected"
                                                ).length
                                            }
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>

                                {/* APPROVED ACCESS LIST */}
                                <TabsContent value="approved" className="mt-4">
                                    {approvedPatients.filter(
                                        (r) => r.status === "approved"
                                    ).length > 0 ? (
                                        <div className="space-y-3">
                                            {approvedPatients
                                                .filter(
                                                    (r) =>
                                                        r.status === "approved"
                                                )
                                                .map((request) => (
                                                    <Card
                                                        key={request._id}
                                                        className="p-4 hover:border-primary/50 transition-colors border-l-4 border-l-success">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage
                                                                        src={
                                                                            request
                                                                                .patientId
                                                                                ?.profilePhoto
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            request
                                                                                .patientId
                                                                                ?.name
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                request
                                                                                    .patientId
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                        <Badge
                                                                            variant="default"
                                                                            className="text-xs">
                                                                            ✓
                                                                            Access
                                                                            Granted
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.age
                                                                        }{" "}
                                                                        years •{" "}
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.gender
                                                                        }
                                                                        {request
                                                                            .patientId
                                                                            ?.bloodGroup &&
                                                                            ` • ${request.patientId.bloodGroup}`}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Access
                                                                        expires:{" "}
                                                                        {formatDate(
                                                                            request.accessExpiresAt
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() =>
                                                                    setSelectedPatient(
                                                                        request.patientId
                                                                    )
                                                                }>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Records
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                            <p className="text-muted-foreground mb-2">
                                                No approved access yet
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Request access from patients
                                                during consultations
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* PENDING REQUESTS */}
                                <TabsContent value="pending" className="mt-4">
                                    {approvedPatients.filter(
                                        (r) => r.status === "pending"
                                    ).length > 0 ? (
                                        <div className="space-y-3">
                                            {approvedPatients
                                                .filter(
                                                    (r) =>
                                                        r.status === "pending"
                                                )
                                                .map((request) => (
                                                    <Card
                                                        key={request._id}
                                                        className="p-4 hover:border-primary/50 transition-colors border-l-4 border-l-orange-500">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage
                                                                        src={
                                                                            request
                                                                                .patientId
                                                                                ?.profilePhoto
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            request
                                                                                .patientId
                                                                                ?.name
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                request
                                                                                    .patientId
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-xs">
                                                                            ⏳
                                                                            Awaiting
                                                                            Response
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.age
                                                                        }{" "}
                                                                        years •{" "}
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.gender
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Requested:{" "}
                                                                        {formatDate(
                                                                            request.createdAt
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Purpose:{" "}
                                                                        {
                                                                            request.purpose
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Pending
                                                            </Badge>
                                                        </div>
                                                    </Card>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                            <p className="text-muted-foreground mb-2">
                                                No pending requests
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                All your access requests have
                                                been processed
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* REJECTED REQUESTS */}
                                <TabsContent value="rejected" className="mt-4">
                                    {approvedPatients.filter(
                                        (r) => r.status === "rejected"
                                    ).length > 0 ? (
                                        <div className="space-y-3">
                                            {approvedPatients
                                                .filter(
                                                    (r) =>
                                                        r.status === "rejected"
                                                )
                                                .map((request) => (
                                                    <Card
                                                        key={request._id}
                                                        className="p-4 hover:border-primary/50 transition-colors border-l-4 border-l-destructive">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage
                                                                        src={
                                                                            request
                                                                                .patientId
                                                                                ?.profilePhoto
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            request
                                                                                .patientId
                                                                                ?.name
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                request
                                                                                    .patientId
                                                                                    ?.name
                                                                            }
                                                                        </p>
                                                                        <Badge
                                                                            variant="destructive"
                                                                            className="text-xs">
                                                                            ✗
                                                                            Access
                                                                            Denied
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.age
                                                                        }{" "}
                                                                        years •{" "}
                                                                        {
                                                                            request
                                                                                .patientId
                                                                                ?.gender
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Rejected:{" "}
                                                                        {formatDate(
                                                                            request.respondedAt ||
                                                                                request.updatedAt
                                                                        )}
                                                                    </p>
                                                                    {request.reason && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Reason:{" "}
                                                                            {
                                                                                request.reason
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleRequestPatientAccess(
                                                                        request
                                                                            .patientId
                                                                            ._id ||
                                                                            request.patientId
                                                                    )
                                                                }
                                                                disabled={
                                                                    requesting
                                                                }>
                                                                {requesting ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                        Request
                                                                        Again
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <X className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                            <p className="text-muted-foreground mb-2">
                                                No rejected requests
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                All your access requests are
                                                pending or approved
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Request Access from Current Patients */}
                            {appointments.filter(
                                (a) =>
                                    a.status === "in_consultation" ||
                                    a.status === "scheduled"
                            ).length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold text-foreground mb-4">
                                        Request Access from Today's Patients
                                    </h4>
                                    <div className="space-y-2">
                                        {appointments
                                            .filter(
                                                (a) =>
                                                    a.status ===
                                                        "in_consultation" ||
                                                    a.status === "scheduled"
                                            )
                                            .map((appointment) => {
                                                // Check if already requested
                                                const existingRequest =
                                                    approvedPatients.find(
                                                        (req) =>
                                                            req.patientId
                                                                ?._id ===
                                                                appointment
                                                                    .patientId
                                                                    ?._id ||
                                                            req.patientId ===
                                                                appointment
                                                                    .patientId
                                                                    ?._id
                                                    );

                                                return (
                                                    <Card
                                                        key={appointment._id}
                                                        className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage
                                                                        src={
                                                                            appointment
                                                                                .patientId
                                                                                ?.profilePhoto
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            appointment
                                                                                .patientId
                                                                                ?.name
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {appointment
                                                                            .patientId
                                                                            ?.name ||
                                                                            "Patient"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Token #
                                                                        {
                                                                            appointment.tokenNumber
                                                                        }
                                                                    </p>
                                                                    {existingRequest && (
                                                                        <Badge
                                                                            variant={
                                                                                existingRequest.status ===
                                                                                "approved"
                                                                                    ? "default"
                                                                                    : existingRequest.status ===
                                                                                      "pending"
                                                                                    ? "secondary"
                                                                                    : "destructive"
                                                                            }
                                                                            className="text-xs mt-1">
                                                                            {existingRequest.status ===
                                                                                "approved" &&
                                                                                "✓ Has Access"}
                                                                            {existingRequest.status ===
                                                                                "pending" &&
                                                                                "⏳ Request Sent"}
                                                                            {existingRequest.status ===
                                                                                "rejected" &&
                                                                                "✗ Denied"}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {existingRequest?.status ===
                                                            "approved" ? (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setSelectedPatient(
                                                                            appointment.patientId
                                                                        )
                                                                    }>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Records
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleRequestPatientAccess(
                                                                            appointment
                                                                                .patientId
                                                                                ._id ||
                                                                                appointment.patientId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        requesting ||
                                                                        existingRequest?.status ===
                                                                            "pending"
                                                                    }>
                                                                    {requesting ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : existingRequest?.status ===
                                                                      "pending" ? (
                                                                        <>
                                                                            <Clock className="h-4 w-4 mr-2" />
                                                                            Pending
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Send className="h-4 w-4 mr-2" />
                                                                            {existingRequest?.status ===
                                                                            "rejected"
                                                                                ? "Request Again"
                                                                                : "Request"}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Medical Record Form Modal */}
            {showMedicalRecordForm && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Complete Medical Record
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Patient:{" "}
                                        {selectedAppointment.patientId?.name ||
                                            "Patient"}{" "}
                                        • Token #
                                        {selectedAppointment.tokenNumber}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowMedicalRecordForm(false);
                                        setSelectedAppointment(null);
                                    }}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <MedicalRecordForm
                                appointmentId={selectedAppointment._id}
                                patientId={
                                    selectedAppointment.patientId._id ||
                                    selectedAppointment.patientId
                                }
                                onSuccess={handleSaveMedicalRecord}
                                onCancel={() => {
                                    setShowMedicalRecordForm(false);
                                    setSelectedAppointment(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Medical History Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Medical History - {selectedPatient.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPatient.age} years •{" "}
                                        {selectedPatient.gender}
                                        {selectedPatient.bloodGroup &&
                                            ` • ${selectedPatient.bloodGroup}`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPatient(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* TABS FOR MEDICAL RECORDS AND MEDICAL HISTORY */}
                            <Tabs defaultValue="history" className="space-y-4">
                                <TabsList className="w-full">
                                    <TabsTrigger
                                        value="history"
                                        className="flex-1">
                                        <User className="h-4 w-4 mr-2" />
                                        Patient Medical History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="records"
                                        className="flex-1">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Medical Records
                                    </TabsTrigger>
                                </TabsList>

                                {/* Patient's Self-Reported Medical History */}
                                <TabsContent value="history" className="mt-4">
                                    <ProviderPatientMedicalHistoryViewer
                                        patientId={selectedPatient._id}
                                    />
                                </TabsContent>

                                {/* Doctor-Created Medical Records */}
                                <TabsContent value="records" className="mt-4">
                                    <MedicalHistoryViewer
                                        patientId={selectedPatient._id}
                                        viewMode="provider"
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            )}

            {/* Medical Record Form Modal 
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Medical History - {selectedPatient.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPatient.age} years •{" "}
                                        {selectedPatient.gender}
                                        {selectedPatient.bloodGroup &&
                                            ` • ${selectedPatient.bloodGroup}`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPatient(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <MedicalHistoryViewer
                                patientId={selectedPatient._id}
                                viewMode="provider"
                            />
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default DoctorDashboard;
