import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { useQueueActions } from "@/hooks/useQueueActions";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";

import Navbar from "@/components/Navbar";
import AppointmentManagement from "@/components/AppointmentManagement";
import MedicalHistoryViewer from "@/components/MedicalHistoryViewer";
import ProviderPatientMedicalHistoryViewer from "@/components/ProviderPatientMedicalHistoryViewer";
import HospitalMonitoringRequests from "@/components/HospitalMonitoringRequests";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Bed,
    Users,
    Stethoscope,
    Activity,
    Loader2,
    Building2,
    Clock,
    Phone,
    Star,
    ChevronRight,
    CalendarDays,
    FileText,
    Eye,
    X,
    Camera,
    Upload,
    Images,
    Plus,
    Calendar,
    MapPin,
    User,
    Edit,
    Search,
    Filter,
    Video,
} from "lucide-react";
import { toast } from "sonner";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HospitalDashboard = () => {
    const { profile } = useAuth();
    const { handleUploadHospitalPhotos, loading: uploadLoading } =
        useAuthActions();
    const { handleGetHospitalById, handleUpdateBed } = useHospitalActions();
    const { handleGetDoctorById, handleUpdateDoctor } = useDoctorActions();
    const { handleGetLiveQueue, handleUpdateDoctorStatus } = useQueueActions();
    const { handleGetApprovedAccessList } = useMedicalRecordActions();

    const fileInputRef = useRef(null);

    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [doctorQueues, setDoctorQueues] = useState({});
    const [beds, setBeds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [approvedPatients, setApprovedPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Photo Upload State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [showPhotoDialog, setShowPhotoDialog] = useState(false);

    // Bed Management State
    const [selectedBed, setSelectedBed] = useState(null);
    const [showBedEditDialog, setShowBedEditDialog] = useState(false);
    const [bedFormData, setBedFormData] = useState({
        status: "",
        reservationTime: "",
        expectedReleaseTime: "",
        notes: "",
        patientId: "",
    });
    const [updatingBed, setUpdatingBed] = useState(false);
    const [bedFilterStatus, setBedFilterStatus] = useState("all");
    const [bedFilterType, setBedFilterType] = useState("all");

    // Fetch doctors and their queues
    const fetchDoctors = async (doctorIds) => {
        const today = new Date().toISOString().split("T")[0];
        try {
            const doctorPromises = doctorIds.map((doctorId) =>
                handleGetDoctorById(doctorId)
            );
            const doctorResults = await Promise.all(doctorPromises);
            const fetchedDoctors = doctorResults
                .filter((result) => result.success)
                .map((result) => result.data);

            setDoctors(fetchedDoctors);

            const queuePromises = fetchedDoctors.map((doctor) =>
                handleGetLiveQueue(doctor._id, today)
            );
            const queueResults = await Promise.all(queuePromises);

            const queuesMap = {};
            queueResults.forEach((result, index) => {
                if (result.success) {
                    queuesMap[fetchedDoctors[index]._id] = result.data;
                }
            });

            setDoctorQueues(queuesMap);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHospitalData = async () => {
        if (!profile?._id) return;
        setLoading(true);

        const result = await handleGetHospitalById(profile._id);
        if (result.success) {
            setHospital(result.data);
            setBeds(result.data.beds || []);

            if (result.data.doctorIds && result.data.doctorIds.length > 0) {
                fetchDoctors(result.data.doctorIds);
            } else {
                setLoading(false);
            }
        } else {
            toast.error("Failed to load hospital data");
            setLoading(false);
        }
    };

    const fetchApprovedPatients = async () => {
        const result = await handleGetApprovedAccessList();
        if (result.success) {
            setApprovedPatients(result.data);
        }
    };

    useEffect(() => {
        fetchHospitalData();
        fetchApprovedPatients();
    }, [profile?._id]);

    // Photo Upload Functions
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const currentPhotoCount = hospital?.photo?.length || 0;
        const availableSlots = 4 - currentPhotoCount;

        if (files.length > availableSlots) {
            toast.error(
                `You can only add ${availableSlots} more photos. Maximum 4 photos allowed.`
            );
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                toast.error("All files must be images");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Each image must be less than 5MB");
                return;
            }
        }

        setSelectedFiles(files);

        const previews = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                if (previews.length === files.length) {
                    setPhotoPreviews(previews);
                    setShowPhotoDialog(true);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoUpload = async () => {
        if (selectedFiles.length === 0) return;

        const result = await handleUploadHospitalPhotos(selectedFiles);
        if (result.success) {
            toast.success(
                `${selectedFiles.length} photos uploaded successfully!`
            );
            setShowPhotoDialog(false);
            setPhotoPreviews([]);
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            await fetchHospitalData();
        } else {
            toast.error(result.error || "Failed to upload photos");
        }
    };

    const handleCancelPhotoUpload = () => {
        setShowPhotoDialog(false);
        setPhotoPreviews([]);
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileInput = () => {
        const currentPhotoCount = hospital?.photo?.length || 0;
        if (currentPhotoCount >= 4) {
            toast.error("Maximum 4 photos allowed.");
            return;
        }
        fileInputRef.current?.click();
    };

    // Doctor Availability Toggle
    const toggleDoctorAvailability = async (doctorId, currentStatus) => {
        const newStatus =
            currentStatus === "available" ? "not_available" : "available";

        const result = await handleUpdateDoctor({
            id: doctorId,
            currentStatus: newStatus,
        });

        if (result.success) {
            setDoctors((prev) =>
                prev.map((d) =>
                    d._id === doctorId ? { ...d, currentStatus: newStatus } : d
                )
            );

            const queue = doctorQueues[doctorId];
            if (queue) {
                await handleUpdateDoctorStatus(
                    queue._id,
                    newStatus === "available" ? "available" : "not_arrived"
                );
            }

            toast.success(
                `Doctor marked ${
                    newStatus === "available" ? "available" : "unavailable"
                }`
            );

            const today = new Date().toISOString().split("T")[0];
            const queueResult = await handleGetLiveQueue(doctorId, today);
            if (queueResult.success) {
                setDoctorQueues((prev) => ({
                    ...prev,
                    [doctorId]: queueResult.data,
                }));
            }
        } else {
            toast.error("Failed to update doctor status");
        }
    };

    // Bed Management Functions
    const handleEditBed = (bed) => {
        setSelectedBed(bed);
        setBedFormData({
            status: bed.status,
            reservationTime: bed.reservationTime
                ? new Date(bed.reservationTime).toISOString().slice(0, 16)
                : "",
            expectedReleaseTime: bed.expectedReleaseTime
                ? new Date(bed.expectedReleaseTime).toISOString().slice(0, 16)
                : "",
            notes: bed.notes || "",
            patientId: bed.patientId?._id || "",
        });
        setShowBedEditDialog(true);
    };

    const handleBedUpdate = async () => {
        if (!selectedBed) return;

        setUpdatingBed(true);

        const result = await handleUpdateBed({
            hospitalId: hospital._id,
            bedId: selectedBed._id,
            ...bedFormData,
        });

        if (result.success) {
            toast.success("Bed updated successfully");
            setShowBedEditDialog(false);
            setSelectedBed(null);
            await fetchHospitalData();
        } else {
            toast.error(result.error || "Failed to update bed");
        }

        setUpdatingBed(false);
    };

    const handleCancelBedEdit = () => {
        setShowBedEditDialog(false);
        setSelectedBed(null);
        setBedFormData({
            status: "",
            reservationTime: "",
            expectedReleaseTime: "",
            notes: "",
            patientId: "",
        });
    };

    // Stats Calculations
    const bedStats = useMemo(() => {
        const total = beds.length;
        const available = beds.filter((b) => b.status === "available").length;
        const occupied = beds.filter((b) => b.status === "occupied").length;
        const reserved = beds.filter((b) => b.status === "reserved").length;
        const utilization =
            total > 0 ? Math.round((occupied / total) * 100) : 0;

        return { total, available, occupied, reserved, utilization };
    }, [beds]);

    const stats = useMemo(() => {
        const totalDoctors = doctors.length;
        const availableDoctors = doctors.filter(
            (d) => d.currentStatus === "available"
        ).length;

        const queues = Object.values(doctorQueues);
        const totalQueueWaiting = queues.reduce(
            (sum, q) => sum + (q?.waitingPatients || 0),
            0
        );
        const totalCompleted = queues.reduce(
            (sum, q) => sum + (q?.completedPatients || 0),
            0
        );

        return {
            totalDoctors,
            availableDoctors,
            totalQueueWaiting,
            totalCompleted,
        };
    }, [doctors, doctorQueues]);

    const filteredBeds = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return beds.filter((bed) => {
            const matchesSearch =
                String(bed.bedNumber).toLowerCase().includes(search) ||
                bed.type?.toLowerCase().includes(search);

            const matchesStatus =
                bedFilterStatus === "all" || bed.status === bedFilterStatus;

            const matchesType =
                bedFilterType === "all" || bed.type === bedFilterType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [beds, searchTerm, bedFilterStatus, bedFilterType]);

    const getInitials = (name) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getBedStatusColor = (status) => {
        switch (status) {
            case "available":
                return "text-green-600 bg-green-50";
            case "occupied":
                return "text-red-600 bg-red-50";
            case "reserved":
                return "text-yellow-600 bg-yellow-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getBedTypeIcon = (type) => {
        return <Bed className="h-4 w-4" />;
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
                        Hospital Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {hospital?.name || "Loading..."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-5 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Total Doctors
                            </p>
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                            {stats.totalDoctors}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.availableDoctors} available
                        </p>
                    </Card>

                    <Card className="p-5 border-l-4 border-l-success">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Available Beds
                            </p>
                            <Bed className="h-4 w-4 text-success" />
                        </div>
                        <p className="text-3xl font-bold text-success">
                            {bedStats.available}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            of {bedStats.total} total beds
                        </p>
                    </Card>

                    <Card className="p-5 border-l-4 border-l-orange-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Queue Total
                            </p>
                            <Users className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-500">
                            {stats.totalQueueWaiting}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            patients waiting
                        </p>
                    </Card>

                    <Card className="p-5 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                Bed Occupancy
                            </p>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-blue-500">
                            {bedStats.utilization}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {bedStats.occupied} occupied
                        </p>
                    </Card>
                </div>

                {/* Hospital Info & Photos Section */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Photo Gallery */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        Hospital Photos
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {hospital?.photo?.length || 0} of 4
                                        photos
                                    </p>
                                </div>
                                <Button
                                    onClick={triggerFileInput}
                                    size="sm"
                                    variant="outline"
                                    disabled={hospital?.photo?.length >= 4}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Photos
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {hospital?.photo && hospital.photo.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Main Photo Carousel */}
                                    <div className="relative group">
                                        <Swiper
                                            modules={[
                                                Navigation,
                                                Pagination,
                                                Autoplay,
                                            ]}
                                            spaceBetween={0}
                                            slidesPerView={1}
                                            navigation={{
                                                nextEl: ".hospital-swiper-button-next",
                                                prevEl: ".hospital-swiper-button-prev",
                                            }}
                                            pagination={{ clickable: true }}
                                            autoplay={{
                                                delay: 4000,
                                                disableOnInteraction: false,
                                                pauseOnMouseEnter: true,
                                            }}
                                            loop={hospital.photo.length > 1}
                                            className="rounded-lg border shadow-sm">
                                            {hospital.photo.map(
                                                (photo, index) => (
                                                    <SwiperSlide key={index}>
                                                        <div
                                                            className="relative w-full"
                                                            style={{
                                                                aspectRatio:
                                                                    "16/9",
                                                            }}>
                                                            <img
                                                                src={photo}
                                                                alt={`${
                                                                    hospital.name
                                                                } - Photo ${
                                                                    index + 1
                                                                }`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </SwiperSlide>
                                                )
                                            )}
                                        </Swiper>

                                        {hospital.photo.length > 1 && (
                                            <>
                                                <button className="hospital-swiper-button-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-200 rotate-180" />
                                                </button>
                                                <button className="hospital-swiper-button-next absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                                                </button>
                                            </>
                                        )}

                                        <div className="absolute bottom-3 right-3 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                            <Images className="w-3 h-3" />
                                            {hospital.photo.length} Photo
                                            {hospital.photo.length > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Thumbnail Grid */}
                                    {hospital.photo.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {hospital.photo.map(
                                                (photo, index) => (
                                                    <button
                                                        key={index}
                                                        className="relative rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                                                        style={{
                                                            aspectRatio: "4/3",
                                                        }}>
                                                        <img
                                                            src={photo}
                                                            alt={`Thumbnail ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onClick={triggerFileInput}
                                    className="w-full rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all"
                                    style={{ aspectRatio: "16/9" }}>
                                    <Camera className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        No photos uploaded yet
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Click to upload hospital photos (max 4)
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Hospital Info Card */}
                    <div className="lg:col-span-1">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Hospital Info
                            </h3>
                            <div className="space-y-4">
                                {hospital?.city && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="text-sm">
                                            {hospital.address && (
                                                <p className="text-foreground mb-0.5">
                                                    {hospital.address}
                                                </p>
                                            )}
                                            <p className="text-muted-foreground">
                                                {hospital.city}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {hospital?.contacts?.phone &&
                                    hospital.contacts.phone[0] && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-foreground">
                                                {hospital.contacts.phone[0]}
                                            </p>
                                        </div>
                                    )}

                                {hospital?.averageRating && (
                                    <div className="flex items-center gap-3">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <p className="text-sm text-foreground">
                                            {hospital.averageRating.toFixed(1)}{" "}
                                            Rating
                                        </p>
                                    </div>
                                )}

                                {hospital?.specialities &&
                                    hospital.specialities.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-foreground mb-2">
                                                Specializations
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {hospital.specialities
                                                    .slice(0, 3)
                                                    .map((spec, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                {hospital.specialities.length >
                                                    3 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs">
                                                        +
                                                        {hospital.specialities
                                                            .length - 3}{" "}
                                                        more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="beds" className="space-y-6">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                            value="beds"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Bed className="h-4 w-4 mr-2" />
                            Bed Management
                            <Badge variant="secondary" className="ml-2">
                                {bedStats.total}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="doctors"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Doctors & Queues
                            <Badge variant="secondary" className="ml-2">
                                {stats.totalDoctors}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="appointments"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Manage Appointments
                        </TabsTrigger>
                        <TabsTrigger
                            value="medical-records"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <FileText className="h-4 w-4 mr-2" />
                            Medical Records
                        </TabsTrigger>
                        <TabsTrigger value="monitoring">
                            <Video className="h-4 w-4 mr-2" />
                            Monitoring Requests
                        </TabsTrigger>

                        <TabsTrigger
                            value="overview"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            <Activity className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                    </TabsList>

                    {/* Bed Management Tab */}
                    <TabsContent value="beds" className="space-y-6">
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        Bed Management
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Monitor and manage hospital bed
                                        availability
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search beds..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Select
                                    value={bedFilterStatus}
                                    onValueChange={setBedFilterStatus}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                            Occupied
                                        </SelectItem>
                                        <SelectItem value="reserved">
                                            Reserved
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={bedFilterType}
                                    onValueChange={setBedFilterType}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        <SelectItem value="general">
                                            General
                                        </SelectItem>
                                        <SelectItem value="icu">ICU</SelectItem>
                                        <SelectItem value="emergency">
                                            Emergency
                                        </SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(bedFilterStatus !== "all" ||
                                    bedFilterType !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setBedFilterStatus("all");
                                            setBedFilterType("all");
                                        }}>
                                        <X className="h-4 w-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            {/* Bed Stats */}
                            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                                <Card className="p-4 bg-primary/5 border-primary/20">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {bedStats.total}
                                    </p>
                                </Card>

                                <Card className="p-4 bg-success/5 border-success/20">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Available
                                    </p>
                                    <p className="text-2xl font-bold text-success">
                                        {bedStats.available}
                                    </p>
                                </Card>

                                <Card className="p-4 bg-orange-50 border-orange-200">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Occupied
                                    </p>
                                    <p className="text-2xl font-bold text-orange-500">
                                        {bedStats.occupied}
                                    </p>
                                </Card>

                                <Card className="p-4 bg-blue-50 border-blue-200">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Reserved
                                    </p>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {bedStats.reserved}
                                    </p>
                                </Card>
                            </div>

                            {/* Bed Table */}
                            {filteredBeds.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[100px]">
                                                    Bed #
                                                </TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Notes</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBeds.map((bed) => (
                                                <TableRow
                                                    key={bed._id}
                                                    className="hover:bg-muted/30">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {getBedTypeIcon(
                                                                bed.type
                                                            )}
                                                            {bed.bedNumber}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="capitalize">
                                                            {bed.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={`capitalize ${getBedStatusColor(
                                                                bed.status
                                                            )}`}>
                                                            {bed.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">
                                                            ₹{bed.price}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {bed.patientId ? (
                                                            <div className="text-sm">
                                                                <p className="font-medium">
                                                                    {bed
                                                                        .patientId
                                                                        .name ||
                                                                        bed.patientId}
                                                                </p>
                                                                {bed.expectedReleaseTime && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Release:{" "}
                                                                        {new Date(
                                                                            bed.expectedReleaseTime
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {bed.notes ? (
                                                            <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                                                                {bed.notes}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleEditBed(
                                                                    bed
                                                                )
                                                            }>
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-lg">
                                    <Bed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        No beds found
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm ||
                                        bedFilterStatus !== "all" ||
                                        bedFilterType !== "all"
                                            ? "Try adjusting your filters"
                                            : "Add beds to start managing"}
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Doctors & Queues Tab */}
                    <TabsContent value="doctors" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Doctor Availability & Live Queues
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Manage doctor availability and monitor patient
                                queues in real-time
                            </p>

                            {doctors.length > 0 ? (
                                <div className="space-y-4">
                                    {doctors.map((doctor) => {
                                        const queue = doctorQueues[doctor._id];
                                        return (
                                            <Card
                                                key={doctor._id}
                                                className="overflow-hidden hover:border-primary/50 transition-colors">
                                                <div className="grid lg:grid-cols-5 gap-0">
                                                    {/* Doctor Info */}
                                                    <div className="lg:col-span-2 p-5">
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                                                <AvatarImage
                                                                    src={
                                                                        doctor.profilePhoto
                                                                    }
                                                                    alt={
                                                                        doctor.name
                                                                    }
                                                                />
                                                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                                                                    {getInitials(
                                                                        doctor.name
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-foreground mb-1 truncate">
                                                                    {
                                                                        doctor.name
                                                                    }
                                                                </h4>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="mb-2 text-xs">
                                                                    {
                                                                        doctor.type
                                                                    }
                                                                </Badge>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                                    <span>
                                                                        {
                                                                            doctor.experience
                                                                        }{" "}
                                                                        yrs
                                                                    </span>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                        <span>
                                                                            {doctor.averageRating.toFixed(
                                                                                1
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {doctor.contact
                                                                    ?.phone && (
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Phone className="h-3 w-3" />
                                                                        <span>
                                                                            {
                                                                                doctor
                                                                                    .contact
                                                                                    .phone
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Queue Status */}
                                                    <div className="lg:col-span-2 bg-muted/30 p-5 border-l">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Activity className="h-4 w-4 text-primary" />
                                                            <h5 className="font-semibold text-sm">
                                                                Today's Queue
                                                            </h5>
                                                        </div>

                                                        {queue ? (
                                                            <div className="space-y-3">
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">
                                                                            Current
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-primary">
                                                                            {queue.currentTokenNumber ||
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">
                                                                            Waiting
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-orange-500">
                                                                            {queue.waitingPatients ||
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">
                                                                            Done
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-success">
                                                                            {queue.completedPatients ||
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between pt-3 border-t">
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>
                                                                            {queue.averageConsultationTime ||
                                                                                15}{" "}
                                                                            min
                                                                            avg
                                                                        </span>
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            queue.doctorStatus ===
                                                                            "available"
                                                                                ? "default"
                                                                                : "secondary"
                                                                        }
                                                                        className="text-xs">
                                                                        {
                                                                            queue.doctorStatus
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6">
                                                                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                                                <p className="text-xs text-muted-foreground">
                                                                    No queue
                                                                    today
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Availability Control */}
                                                    <div className="lg:col-span-1 p-5 border-l flex flex-col justify-between">
                                                        <div>
                                                            <Label
                                                                htmlFor={`availability-${doctor._id}`}
                                                                className="text-xs font-medium text-muted-foreground mb-3 block">
                                                                Doctor Status
                                                            </Label>
                                                            <div className="flex items-center gap-3">
                                                                <Switch
                                                                    id={`availability-${doctor._id}`}
                                                                    checked={
                                                                        doctor.currentStatus ===
                                                                        "available"
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        toggleDoctorAvailability(
                                                                            doctor._id,
                                                                            doctor.currentStatus
                                                                        )
                                                                    }
                                                                />
                                                                <Badge
                                                                    variant={
                                                                        doctor.currentStatus ===
                                                                        "available"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                    className="text-xs">
                                                                    {doctor.currentStatus ===
                                                                    "available"
                                                                        ? "Available"
                                                                        : "Offline"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full mt-4"
                                                            onClick={() =>
                                                                window.open(
                                                                    `/doctor/${doctor._id}`,
                                                                    "_blank"
                                                                )
                                                            }>
                                                            View Profile
                                                            <ChevronRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        No Doctors Added
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Add doctors to start managing their
                                        availability
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Manage Appointments Tab */}
                    <TabsContent value="appointments" className="space-y-6">
                        {doctors.length > 0 ? (
                            <div className="space-y-6">
                                {doctors.map((doctor) => (
                                    <Card key={doctor._id} className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={doctor.profilePhoto}
                                                    alt={doctor.name}
                                                />
                                                <AvatarFallback>
                                                    {getInitials(doctor.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-semibold">
                                                    Dr. {doctor.name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {doctor.type}
                                                </p>
                                            </div>
                                        </div>
                                        <AppointmentManagement
                                            doctorId={doctor._id}
                                            hospitalId={hospital?._id}
                                            userRole="hospital"
                                            onRefresh={fetchHospitalData}
                                        />
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center">
                                <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground mb-1">
                                    No Doctors Added
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Add doctors to view their appointments
                                </p>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Medical Records Tab */}
                    <TabsContent value="medical-records" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Patient Medical Records
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                View medical records of patients treated at your
                                hospital
                            </p>

                            {approvedPatients.length > 0 ? (
                                <div className="space-y-3">
                                    {approvedPatients.map((request) => (
                                        <Card
                                            key={request._id}
                                            className="p-4 hover:border-primary/50 transition-colors">
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
                                                        <p className="font-medium text-foreground">
                                                            {
                                                                request
                                                                    .patientId
                                                                    ?.name
                                                            }
                                                        </p>
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
                                                            {request.patientId
                                                                ?.bloodGroup &&
                                                                ` • ${request.patientId.bloodGroup}`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Access granted to
                                                            hospital
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
                                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4 opacity-50" />
                                    <h4 className="text-lg font-semibold text-foreground mb-2">
                                        No Medical Records Access
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Medical records will appear here when
                                        patients grant access to your hospital
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Patient Monitoring Requests
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Family members requesting to monitor admitted
                                patients
                            </p>

                            <HospitalMonitoringRequests
                                hospitalId={hospital._id}
                            />
                        </Card>
                    </TabsContent>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Today's Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Active Doctors
                                        </span>
                                        <Badge>{stats.availableDoctors}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Total Queue
                                        </span>
                                        <Badge variant="secondary">
                                            {stats.totalQueueWaiting}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Completed Consultations
                                        </span>
                                        <Badge variant="default">
                                            {stats.totalCompleted}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <span className="text-sm text-muted-foreground">
                                            Bed Utilization
                                        </span>
                                        <Badge variant="outline">
                                            {bedStats.utilization}%
                                        </Badge>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View All Appointments
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline">
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Staff
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline">
                                        <Activity className="h-4 w-4 mr-2" />
                                        Generate Reports
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-6 md:col-span-2">
                                <h3 className="text-lg font-semibold mb-4">
                                    Department Performance
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Average Wait Time
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {stats.avgConsultationTime || 15}{" "}
                                            min
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Patient Satisfaction
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            4.5/5
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Efficiency Rate
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            92%
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Photo Upload Dialog */}
                <Dialog
                    open={showPhotoDialog}
                    onOpenChange={setShowPhotoDialog}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload Hospital Photos</DialogTitle>
                            <DialogDescription>
                                Preview {selectedFiles.length} photos before
                                uploading.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {photoPreviews.length === 1 ? (
                                <div
                                    className="relative rounded-lg overflow-hidden border"
                                    style={{ aspectRatio: "16/9" }}>
                                    <img
                                        src={photoPreviews[0]}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    {uploadLoading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {photoPreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="relative rounded-lg overflow-hidden border"
                                            style={{ aspectRatio: "4/3" }}>
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <Badge
                                                className="absolute top-2 right-2"
                                                variant="secondary">
                                                {index + 1}
                                            </Badge>
                                            {uploadLoading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
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
                                        Upload {selectedFiles.length} Photos
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Bed Edit Dialog */}
                <Dialog
                    open={showBedEditDialog}
                    onOpenChange={setShowBedEditDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Bed #{selectedBed?.bedNumber}
                            </DialogTitle>
                            <DialogDescription>
                                Update bed status and patient information
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Bed Status */}
                            <div>
                                <Label htmlFor="status">Bed Status *</Label>
                                <Select
                                    value={bedFormData.status}
                                    onValueChange={(value) =>
                                        setBedFormData({
                                            ...bedFormData,
                                            status: value,
                                        })
                                    }>
                                    <SelectTrigger id="status" className="mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                            Occupied
                                        </SelectItem>
                                        <SelectItem value="reserved">
                                            Reserved
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reservation Time */}
                            {(bedFormData.status === "reserved" ||
                                bedFormData.status === "occupied") && (
                                <div>
                                    <Label htmlFor="reservationTime">
                                        {bedFormData.status === "reserved"
                                            ? "Reservation Time"
                                            : "Admission Time"}
                                    </Label>
                                    <Input
                                        id="reservationTime"
                                        type="datetime-local"
                                        value={bedFormData.reservationTime}
                                        onChange={(e) =>
                                            setBedFormData({
                                                ...bedFormData,
                                                reservationTime: e.target.value,
                                            })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            {/* Expected Release Time */}
                            {bedFormData.status === "occupied" && (
                                <div>
                                    <Label htmlFor="expectedReleaseTime">
                                        Expected Discharge Time
                                    </Label>
                                    <Input
                                        id="expectedReleaseTime"
                                        type="datetime-local"
                                        value={bedFormData.expectedReleaseTime}
                                        onChange={(e) =>
                                            setBedFormData({
                                                ...bedFormData,
                                                expectedReleaseTime:
                                                    e.target.value,
                                            })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            {/* Patient ID (for occupied beds) */}
                            {bedFormData.status === "occupied" && (
                                <div>
                                    <Label htmlFor="patientId">
                                        Patient ID
                                    </Label>
                                    <Input
                                        id="patientId"
                                        placeholder="Enter patient ID"
                                        value={bedFormData.patientId}
                                        onChange={(e) =>
                                            setBedFormData({
                                                ...bedFormData,
                                                patientId: e.target.value,
                                            })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes about this bed"
                                    value={bedFormData.notes}
                                    onChange={(e) =>
                                        setBedFormData({
                                            ...bedFormData,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            {/* Current Info Display */}
                            {selectedBed && (
                                <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Bed Type:{" "}
                                        <span className="font-medium text-foreground capitalize">
                                            {selectedBed.type}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Price:{" "}
                                        <span className="font-medium text-foreground">
                                            ₹{selectedBed.price}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancelBedEdit}
                                disabled={updatingBed}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBedUpdate}
                                disabled={updatingBed || !bedFormData.status}>
                                {updatingBed ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Bed"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Patient Medical History Modal */}
                {selectedPatient && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            Medical History -{" "}
                                            {selectedPatient.name}
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
                                        onClick={() =>
                                            setSelectedPatient(null)
                                        }>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* TABS FOR MEDICAL RECORDS AND MEDICAL HISTORY */}
                                <Tabs
                                    defaultValue="history"
                                    className="space-y-4">
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
                                    <TabsContent
                                        value="history"
                                        className="mt-4">
                                        <ProviderPatientMedicalHistoryViewer
                                            patientId={selectedPatient._id}
                                        />
                                    </TabsContent>

                                    {/* Doctor-Created Medical Records */}
                                    <TabsContent
                                        value="records"
                                        className="mt-4">
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
            </div>
        </div>
    );
};

export default HospitalDashboard;
