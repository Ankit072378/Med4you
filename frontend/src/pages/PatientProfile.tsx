import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import Navbar from "@/components/Navbar";
import MedicalHistoryViewer from "@/components/MedicalHistoryViewer";
import AccessRequestManager from "@/components/AccessRequestManager";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    Droplet,
    FileText,
    Download,
    Lock,
    Loader2,
    MapPin,
    Phone,
    Activity,
    Heart,
    Pill,
    AlertCircle,
    Camera,
    Upload,
    Edit2,
    Plus,
    Syringe,
    Users,
    Briefcase,
    Scissors,
    Cigarette,
    Wine,
    HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

const PatientProfile = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { handleProfilePhotoUpload, loading: uploadLoading } =
        useAuthActions();
    const navigate = useNavigate();
    const {
        handleGetPatientAccessRequests,
        handleGetMyMedicalHistory,
        loading: medicalLoading,
    } = useMedicalRecordActions();
    const fileInputRef = useRef(null);

    const [accessRequests, setAccessRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPhotoDialog, setShowPhotoDialog] = useState(false);

    // Medical History State
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user?.role !== "patient") {
            navigate("/");
            return;
        }

        if (profile) {
            fetchAccessRequests();
            fetchMedicalHistory();
        }
    }, [user, profile, authLoading, navigate]);

    const fetchAccessRequests = async () => {
        setLoading(true);
        const result = await handleGetPatientAccessRequests(profile._id);
        if (result.success) {
            setAccessRequests(result.data);
            setPendingCount(
                result.data.filter((r) => r.status === "pending").length
            );
        } else {
            toast.error("Failed to load access requests");
        }
        setLoading(false);
    };

    const fetchMedicalHistory = async () => {
        setHistoryLoading(true);
        const result = await handleGetMyMedicalHistory();
        if (result.success) {
            setMedicalHistory(result.data);
        } else {
            setMedicalHistory(null);
        }
        setHistoryLoading(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
            setShowPhotoDialog(true);
        };
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = async () => {
        if (!selectedFile) return;

        const result = await handleProfilePhotoUpload(selectedFile);
        if (result.success) {
            toast.success("Profile photo updated successfully!");
            setShowPhotoDialog(false);
            setPhotoPreview(null);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
            toast.error(result.error || "Failed to update profile photo");
        }
    };

    const handleCancelPhotoUpload = () => {
        setShowPhotoDialog(false);
        setPhotoPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDownloadHistory = () => {
        toast.info("Downloading medical history...");
    };

    const handleEditMedicalHistory = () => {
        navigate("/medical-history/edit");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-20 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Loading your profile...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-20 flex items-center justify-center">
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">
                            No profile data found
                        </p>
                        <Button onClick={() => navigate("/")}>Go Home</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Patient Profile
                        </h1>
                        <p className="text-muted-foreground">
                            Your complete medical information and history
                        </p>
                    </div>

                    {/* Patient Info Card */}
                    <Card className="p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative group">
                                    <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                                        <AvatarImage
                                            src={profile.profilePhoto}
                                        />
                                        <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-accent text-white">
                                            {getInitials(profile.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <Camera className="h-6 w-6 text-white" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48">
                                            <DropdownMenuItem
                                                onClick={triggerFileInput}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                {profile.profilePhoto
                                                    ? "Change Photo"
                                                    : "Upload Photo"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        {profile.name}
                                    </h2>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center space-x-1">
                                            <User className="h-4 w-4" />
                                            <span>
                                                {profile.age} years •{" "}
                                                {profile.gender}
                                            </span>
                                        </span>
                                        {(medicalHistory?.bloodType ||
                                            profile.bloodGroup) && (
                                            <span className="flex items-center space-x-1">
                                                <Droplet className="h-4 w-4" />
                                                <span>
                                                    Blood:{" "}
                                                    {medicalHistory?.bloodType ||
                                                        profile.bloodGroup}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleDownloadHistory}>
                                <Download className="h-4 w-4 mr-2" />
                                Download History
                            </Button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="grid md:grid-cols-2 gap-6">
                                {profile.address && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Address
                                        </p>
                                        <p className="text-foreground">
                                            {profile.address}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Contact
                                    </p>
                                    <p className="text-foreground">
                                        {user.phone}
                                    </p>
                                </div>
                            </div>

                            {profile.emergencyContacts &&
                                profile.emergencyContacts.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">
                                            Emergency Contacts
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {profile.emergencyContacts.map(
                                                (contact, idx) => (
                                                    <Card
                                                        key={idx}
                                                        className="p-4">
                                                        <p className="font-medium text-foreground">
                                                            {contact.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {contact.relation}
                                                        </p>
                                                        <p className="text-sm text-foreground mt-1">
                                                            {contact.phone}
                                                        </p>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </Card>

                    {/* Photo Upload Dialog */}
                    <Dialog
                        open={showPhotoDialog}
                        onOpenChange={setShowPhotoDialog}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {profile.profilePhoto
                                        ? "Update Profile Photo"
                                        : "Upload Profile Photo"}
                                </DialogTitle>
                                <DialogDescription>
                                    Preview your new profile photo before
                                    uploading.
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
                                    This photo will be visible to doctors and
                                    hospitals you interact with.
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

                    {/* Privacy Notice */}
                    {pendingCount > 0 && (
                        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="text-sm flex-1">
                                    <p className="font-medium text-foreground mb-1">
                                        Doctor Access Control
                                    </p>
                                    <p className="text-muted-foreground">
                                        You have {pendingCount} pending access
                                        request
                                        {pendingCount > 1 ? "s" : ""} from
                                        doctors/hospitals to view your medical
                                        history. Review and respond in the
                                        Access Requests tab.
                                    </p>
                                </div>
                                <Badge variant="destructive">
                                    {pendingCount} Pending
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Medical History Notice/Edit Button */}
                    {!historyLoading && (
                        <Card className="mb-6 p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-2">
                                        {medicalHistory
                                            ? "Update Your Medical History"
                                            : "Complete Your Medical History"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {medicalHistory
                                            ? "Keep your medical information up-to-date. Add new allergies, medications, or conditions as needed."
                                            : "Add your medical history to help doctors provide better care. Include allergies, chronic conditions, medications, and past surgeries."}
                                    </p>
                                    <Button
                                        onClick={handleEditMedicalHistory}
                                        size="sm">
                                        {medicalHistory ? (
                                            <>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit Medical History
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Medical History
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Main Tabs */}
                    <Tabs defaultValue="summary" className="space-y-6">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="summary">
                                <Activity className="h-4 w-4 mr-2" />
                                Health Summary
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <FileText className="h-4 w-4 mr-2" />
                                Medical Records
                            </TabsTrigger>
                            <TabsTrigger value="access">
                                <Lock className="h-4 w-4 mr-2" />
                                Access Requests
                                {pendingCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-2 text-xs">
                                        {pendingCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Health Summary Tab */}
                        <TabsContent value="summary">
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : medicalHistory ? (
                                <div className="space-y-6">
                                    {/* Row 1: Overview Cards */}
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Basic Info */}
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                                <User className="h-5 w-5 mr-2 text-primary" />
                                                Basic Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Age
                                                    </span>
                                                    <span className="font-medium">
                                                        {profile.age} years
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Blood Type
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {medicalHistory.bloodType}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Gender
                                                    </span>
                                                    <span className="font-medium">
                                                        {profile.gender}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Social History */}
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                                <Briefcase className="h-5 w-5 mr-2 text-teal-500" />
                                                Lifestyle
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <Cigarette className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">
                                                            Smoking
                                                        </p>
                                                        <p className="text-sm font-medium capitalize">
                                                            {medicalHistory
                                                                .socialHistory
                                                                ?.smokingStatus ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Wine className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">
                                                            Alcohol
                                                        </p>
                                                        <p className="text-sm font-medium capitalize">
                                                            {medicalHistory
                                                                .socialHistory
                                                                ?.alcoholConsumption ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground">
                                                            Exercise
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {medicalHistory
                                                                .socialHistory
                                                                ?.exerciseFrequency ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {medicalHistory.socialHistory
                                                    ?.occupation && (
                                                    <div className="flex items-start gap-2">
                                                        <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                        <div className="flex-1">
                                                            <p className="text-xs text-muted-foreground">
                                                                Occupation
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    medicalHistory
                                                                        .socialHistory
                                                                        .occupation
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>

                                        {/* Statistics */}
                                        <Card className="p-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                                <Activity className="h-5 w-5 mr-2 text-primary" />
                                                Statistics
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Total Visits
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {medicalHistory
                                                            .statistics
                                                            ?.totalVisits || 0}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Prescriptions
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {medicalHistory
                                                            .statistics
                                                            ?.totalPrescriptions ||
                                                            0}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                    <span className="text-sm text-muted-foreground">
                                                        Lab Tests
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {medicalHistory
                                                            .statistics
                                                            ?.totalLabTests || 0}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Row 2: Chronic Conditions & Allergies */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Chronic Conditions */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <HeartPulse className="h-5 w-5 mr-2 text-orange-500" />
                                                    Chronic Conditions
                                                </h3>
                                                {medicalHistory
                                                    ?.chronicConditions
                                                    ?.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {
                                                            medicalHistory
                                                                .chronicConditions
                                                                .length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            {medicalHistory?.chronicConditions
                                                ?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {medicalHistory.chronicConditions.map(
                                                        (condition, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                condition.condition
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            Diagnosed:{" "}
                                                                            {formatDate(
                                                                                condition.diagnosedDate
                                                                            )}
                                                                        </p>
                                                                        {condition.managementPlan && (
                                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                                {
                                                                                    condition.managementPlan
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            condition.status ===
                                                                            "managed"
                                                                                ? "secondary"
                                                                                : condition.status ===
                                                                                  "active"
                                                                                ? "destructive"
                                                                                : "outline"
                                                                        }
                                                                        className="capitalize ml-2">
                                                                        {
                                                                            condition.status
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        No chronic conditions
                                                        recorded
                                                    </p>
                                                </div>
                                            )}
                                        </Card>

                                        {/* Allergies */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                                    Allergies
                                                </h3>
                                                {medicalHistory?.allergies
                                                    ?.length > 0 && (
                                                    <Badge variant="destructive">
                                                        {
                                                            medicalHistory
                                                                .allergies.length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            {medicalHistory?.allergies?.length >
                                            0 ? (
                                                <div className="space-y-3">
                                                    {medicalHistory.allergies.map(
                                                        (allergy, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        allergy.allergen
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs capitalize">
                                                                        {
                                                                            allergy.type
                                                                        }
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={
                                                                            allergy.severity ===
                                                                                "life_threatening" ||
                                                                            allergy.severity ===
                                                                                "severe"
                                                                                ? "destructive"
                                                                                : "secondary"
                                                                        }
                                                                        className="text-xs capitalize">
                                                                        {allergy.severity.replace(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </Badge>
                                                                </div>
                                                                {allergy.reaction && (
                                                                    <p className="text-xs text-muted-foreground mt-2">
                                                                        Reaction:{" "}
                                                                        {
                                                                            allergy.reaction
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        No allergies recorded
                                                    </p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    {/* Row 3: Current Medications */}
                                    <Card className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                <Pill className="h-5 w-5 mr-2 text-green-500" />
                                                Current Medications
                                            </h3>
                                            {medicalHistory?.currentMedications
                                                ?.length > 0 && (
                                                <Badge variant="secondary">
                                                    {
                                                        medicalHistory
                                                            .currentMedications
                                                            .length
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                        {medicalHistory?.currentMedications
                                            ?.length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {medicalHistory.currentMedications.map(
                                                    (medication, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    medication.medication
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {
                                                                    medication.dosage
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    medication.frequency
                                                                }
                                                            </p>
                                                            {medication.reason && (
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    For:{" "}
                                                                    {
                                                                        medication.reason
                                                                    }
                                                                </p>
                                                            )}
                                                            {medication.prescribedBy && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Prescribed
                                                                    by:{" "}
                                                                    {
                                                                        medication.prescribedBy
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-muted-foreground">
                                                    No current medications
                                                </p>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Row 4: Surgeries & Immunizations */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Past Surgeries */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <Scissors className="h-5 w-5 mr-2 text-blue-500" />
                                                    Past Surgeries
                                                </h3>
                                                {medicalHistory?.surgeries
                                                    ?.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {
                                                            medicalHistory
                                                                .surgeries.length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            {medicalHistory?.surgeries?.length >
                                            0 ? (
                                                <div className="space-y-3">
                                                    {medicalHistory.surgeries.map(
                                                        (surgery, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        surgery.procedure
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {formatDate(
                                                                        surgery.date
                                                                    )}{" "}
                                                                    •{" "}
                                                                    {
                                                                        surgery.hospital
                                                                    }
                                                                </p>
                                                                {surgery.surgeon && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Surgeon:{" "}
                                                                        {
                                                                            surgery.surgeon
                                                                        }
                                                                    </p>
                                                                )}
                                                                {surgery.notes && (
                                                                    <p className="text-xs text-muted-foreground mt-2">
                                                                        {
                                                                            surgery.notes
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        No past surgeries
                                                        recorded
                                                    </p>
                                                </div>
                                            )}
                                        </Card>

                                        {/* Immunizations */}
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <Syringe className="h-5 w-5 mr-2 text-purple-500" />
                                                    Immunizations
                                                </h3>
                                                {medicalHistory?.immunizations
                                                    ?.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {
                                                            medicalHistory
                                                                .immunizations
                                                                .length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            {medicalHistory?.immunizations
                                                ?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {medicalHistory.immunizations.map(
                                                        (
                                                            immunization,
                                                            idx
                                                        ) => (
                                                            <div
                                                                key={idx}
                                                                className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                                                <p className="font-medium text-foreground">
                                                                    {
                                                                        immunization.vaccine
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Given:{" "}
                                                                    {formatDate(
                                                                        immunization.date
                                                                    )}
                                                                </p>
                                                                {immunization.nextDueDate && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Next due:{" "}
                                                                        {formatDate(
                                                                            immunization.nextDueDate
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {immunization.administeredBy && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {
                                                                            immunization.administeredBy
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        No immunizations recorded
                                                    </p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    {/* Row 5: Family History */}
                                    {medicalHistory?.familyHistory?.length >
                                        0 && (
                                        <Card className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <Users className="h-5 w-5 mr-2 text-indigo-500" />
                                                    Family History
                                                </h3>
                                                <Badge variant="secondary">
                                                    {
                                                        medicalHistory
                                                            .familyHistory.length
                                                    }
                                                </Badge>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {medicalHistory.familyHistory.map(
                                                    (history, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-medium text-foreground">
                                                                        {
                                                                            history.condition
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {
                                                                            history.relation
                                                                        }
                                                                    </p>
                                                                </div>
                                                                {history.ageOfOnset && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2">
                                                                        Age{" "}
                                                                        {
                                                                            history.ageOfOnset
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <Card className="p-12 text-center">
                                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Medical History
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Add your medical history to get a
                                        comprehensive health overview
                                    </p>
                                    <Button onClick={handleEditMedicalHistory}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Medical History
                                    </Button>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Medical Records Tab */}
                        <TabsContent value="history">
                            <MedicalHistoryViewer
                                patientId={profile._id}
                                viewMode="patient"
                                onRefresh={fetchMedicalHistory}
                            />
                        </TabsContent>

                        {/* Access Requests Tab */}
                        <TabsContent value="access">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    Access Requests from Doctors & Hospitals
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage who can view your medical history.
                                    You can approve or deny each request, and
                                    revoke access anytime.
                                </p>
                                <AccessRequestManager
                                    patientId={profile._id}
                                    onUpdate={fetchAccessRequests}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Info Card */}
                    <Card className="mt-8 p-6 bg-muted/50">
                        <h3 className="font-semibold text-foreground mb-4">
                            How Medical History Helps:
                        </h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>
                                    Never forget your medical history - all
                                    treatments, tests, and prescriptions in one
                                    place
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>
                                    Doctors can make better diagnoses by seeing
                                    your complete medical journey
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>
                                    No more lost reports - all documents
                                    digitally stored and accessible
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>
                                    You control who can see your data with
                                    doctor access permissions
                                </span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
