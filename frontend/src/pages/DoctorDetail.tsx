import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import LiveQueueDisplay from "@/components/LiveQueueDisplay";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Calendar,
    GraduationCap,
    Building2,
    Phone,
    MapPin,
    Star,
    Mail,
    Loader2,
    IndianRupee,
    Clock,
    Languages,
    UserPlus,
} from "lucide-react";
import { toast } from "sonner";

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { handleGetDoctorById, loading, error } = useDoctorActions();
    const { handleAddDoctor, loading: addingDoctor } = useHospitalActions();

    const [doctor, setDoctor] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Check if current user is a hospital and if doctor is already added
    const isHospital = user?.role === "hospital";
    const isDoctorAlreadyAdded =
        isHospital &&
        profile?.doctorIds?.some((docId) => docId === id || docId._id === id);

    useEffect(() => {
        const fetchDoctor = async () => {
            const result = await handleGetDoctorById(id);
            if (result.success) {
                setDoctor(result.data);
            } else {
                toast.error("Failed to load doctor details");
            }
        };

        if (id) {
            fetchDoctor();
        }
    }, [id]);

    const handleAddDoctorToHospital = async () => {
        if (!isHospital) {
            toast.error("Only hospitals can add doctors");
            return;
        }

        if (isDoctorAlreadyAdded) {
            toast.info("Doctor is already added to your hospital");
            return;
        }

        const result = await handleAddDoctor({ doctorId: id });

        if (result.success) {
            toast.success("Doctor added to your hospital successfully!");
            // Refresh doctor data to update UI
            const refreshResult = await handleGetDoctorById(id);
            if (refreshResult.success) {
                setDoctor(refreshResult.data);
            }
        } else {
            toast.error(result.error || "Failed to add doctor to hospital");
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-24 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Loading doctor details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-16 max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                        Doctor not found
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        {error ||
                            "The doctor you're looking for doesn't exist."}
                    </p>
                    <Button
                        onClick={() => navigate("/doctors")}
                        variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Doctors
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-muted/30 to-background border-b">
                <div className="container py-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4 -ml-3">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Doctor Info */}
                        <div className="lg:col-span-3">
                            <div className="flex gap-6 items-start">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-md flex-shrink-0">
                                    <AvatarImage
                                        src={doctor.profilePhoto}
                                        alt={doctor.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-3xl font-bold">
                                        {getInitials(doctor.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl font-bold text-foreground mb-2 leading-tight">
                                        {doctor.name}
                                    </h1>
                                    <p className="text-lg text-primary font-medium mb-3">
                                        {doctor.type}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-800/30">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span className="font-semibold text-sm">
                                                {doctor.averageRating.toFixed(
                                                    1
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ({doctor.ratingCount})
                                            </span>
                                        </div>

                                        <Badge
                                            variant="secondary"
                                            className="font-normal">
                                            {doctor.experience} years exp
                                        </Badge>

                                        <Badge
                                            className={
                                                doctor.currentStatus ===
                                                "available"
                                                    ? "bg-success text-white"
                                                    : "bg-muted text-muted-foreground"
                                            }>
                                            {doctor.currentStatus ===
                                            "available"
                                                ? "Available"
                                                : "Not Available"}
                                        </Badge>
                                    </div>

                                    {doctor.city && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{doctor.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fee & Actions */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="p-5 border-l-4 border-l-primary">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Consultation Fee
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <IndianRupee className="h-5 w-5 text-primary" />
                                    <span className="text-3xl font-bold text-foreground">
                                        {doctor.fee}
                                    </span>
                                </div>
                                {doctor.age && (
                                    <p className="text-sm text-muted-foreground">
                                        {doctor.age} years old
                                    </p>
                                )}
                            </Card>

                            <div className="space-y-2">
                                {/* Show Add Doctor button only for hospitals */}
                                {isHospital && (
                                    <Button
                                        className="w-full justify-start"
                                        size="lg"
                                        variant={
                                            isDoctorAlreadyAdded
                                                ? "outline"
                                                : "default"
                                        }
                                        onClick={handleAddDoctorToHospital}
                                        disabled={
                                            addingDoctor || isDoctorAlreadyAdded
                                        }>
                                        {addingDoctor ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : isDoctorAlreadyAdded ? (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Already Added
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add to My Hospital
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Show Book Appointment for non-hospital users */}
                                {!isHospital && (
                                    <Button
                                        className="w-full justify-start"
                                        size="lg"
                                        onClick={() =>
                                            setShowBookingModal(true)
                                        }>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Book Appointment
                                    </Button>
                                )}

                                {doctor.contact?.phone && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            (window.location.href = `tel:${doctor.contact.phone}`)
                                        }>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Doctor
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-10">
                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Tabs Section */}
                    <div className="lg:col-span-2">
                        {/* Live Queue */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Today's Queue
                            </h2>
                            <LiveQueueDisplay doctorId={doctor._id} />
                        </div>

                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                <TabsTrigger
                                    value="about"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                                    About
                                </TabsTrigger>
                                <TabsTrigger
                                    value="education"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                                    Education
                                </TabsTrigger>
                                <TabsTrigger
                                    value="specializations"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                                    Expertise
                                </TabsTrigger>
                                <TabsTrigger
                                    value="schedule"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                                    Schedule
                                </TabsTrigger>
                            </TabsList>

                            {/* About Tab */}
                            <TabsContent
                                value="about"
                                className="mt-6 space-y-6">
                                {doctor.about && (
                                    <Card className="p-5">
                                        <h3 className="text-base font-semibold mb-3">
                                            About {doctor.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {doctor.about}
                                        </p>
                                    </Card>
                                )}

                                <div className="grid md:grid-cols-2 gap-5">
                                    {doctor.languages &&
                                        doctor.languages.length > 0 && (
                                            <Card className="p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Languages className="h-4 w-4 text-primary" />
                                                    <h4 className="text-sm font-semibold">
                                                        Languages
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {doctor.languages.map(
                                                        (lang, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="font-normal">
                                                                {lang}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </Card>
                                        )}

                                    {doctor.gender && (
                                        <Card className="p-5">
                                            <h4 className="text-sm font-semibold mb-3">
                                                Gender
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className="font-normal">
                                                {doctor.gender}
                                            </Badge>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Education Tab */}
                            <TabsContent
                                value="education"
                                className="mt-6 space-y-5">
                                {doctor.qualifications &&
                                    doctor.qualifications.length > 0 && (
                                        <Card className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                                <h3 className="text-sm font-semibold">
                                                    Qualifications
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {doctor.qualifications.map(
                                                    (qual, idx) =>
                                                        qual.trim() && (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="font-normal">
                                                                {qual}
                                                            </Badge>
                                                        )
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                {doctor.educationTimeline &&
                                doctor.educationTimeline.length > 0 ? (
                                    <Card className="p-5">
                                        <h3 className="text-sm font-semibold mb-4">
                                            Education History
                                        </h3>
                                        <div className="space-y-4">
                                            {doctor.educationTimeline.map(
                                                (edu, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                                                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <GraduationCap className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <h4 className="font-medium text-sm">
                                                                    {
                                                                        edu.courseName
                                                                    }
                                                                </h4>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs flex-shrink-0">
                                                                    {
                                                                        edu.startYear
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        edu.endYear
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                {
                                                                    edu.institution
                                                                }
                                                            </p>
                                                            {edu.smallAbout && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        edu.smallAbout
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </Card>
                                ) : null}
                            </TabsContent>

                            {/* Specializations Tab */}
                            <TabsContent
                                value="specializations"
                                className="mt-6">
                                <Card className="p-5">
                                    <h3 className="text-sm font-semibold mb-4">
                                        Areas of Expertise
                                    </h3>
                                    {doctor.specializations &&
                                    doctor.specializations.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {doctor.specializations.map(
                                                (spec, idx) =>
                                                    spec.trim() && (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="font-normal">
                                                            {spec}
                                                        </Badge>
                                                    )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            No specializations listed
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>

                            {/* Schedule Tab */}
                            <TabsContent value="schedule" className="mt-6">
                                <Card className="p-5">
                                    <h3 className="text-sm font-semibold mb-4">
                                        Weekly Schedule
                                    </h3>
                                    {doctor.schedule &&
                                    doctor.schedule.length > 0 ? (
                                        <div className="space-y-2">
                                            {doctor.schedule.map(
                                                (slot, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <Badge variant="outline">
                                                            {slot.day}
                                                        </Badge>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {slot.startTime}{" "}
                                                                - {slot.endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            No schedule available
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Associated Hospitals */}
                        {doctor.hospitals && doctor.hospitals.length > 0 && (
                            <Card className="p-5">
                                <h3 className="text-sm font-semibold mb-3">
                                    Associated Hospitals
                                </h3>
                                <div className="space-y-2">
                                    {doctor.hospitals.map((hospitalId, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() =>
                                                navigate(
                                                    `/hospital/${hospitalId}`
                                                )
                                            }
                                            className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer text-sm">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <span className="text-primary hover:underline">
                                                View Hospital
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Contact */}
                        <Card className="p-5">
                            <h3 className="text-sm font-semibold mb-3">
                                Contact Information
                            </h3>
                            <div className="space-y-2">
                                {doctor.contact?.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{doctor.contact.phone}</span>
                                    </div>
                                )}
                                {doctor.contact?.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="break-all">
                                            {doctor.contact.email}
                                        </span>
                                    </div>
                                )}
                                {doctor.address && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{doctor.address}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Booking Modal - Only show for non-hospital users */}
            {!isHospital && (
                <AppointmentBookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    doctor={doctor}
                    hospitalId={doctor.hospitals[0]}
                />
            )}
        </div>
    );
};

export default DoctorDetail;
