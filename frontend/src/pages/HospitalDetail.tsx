import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { useQueueActions } from "@/hooks/useQueueActions";
import Navbar from "@/components/Navbar";
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MapPin,
    Star,
    Phone,
    Mail,
    Bed,
    ArrowLeft,
    Building2,
    Loader2,
    Stethoscope,
    Calendar,
    Clock,
    Users,
    Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";


const HospitalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { handleGetHospitalById, loading: hospitalLoading } =
        useHospitalActions();
    const { handleGetDoctorById, loading: doctorLoading } = useDoctorActions();
    const { handleGetLiveQueue } = useQueueActions();
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [doctorQueues, setDoctorQueues] = useState({});
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    // Fetch hospital data
    useEffect(() => {
        const fetchHospital = async () => {
            const result = await handleGetHospitalById(id);
            if (result.success) {
                setHospital(result.data);
                if (result.data.doctorIds && result.data.doctorIds.length > 0) {
                    fetchDoctors(result.data.doctorIds);
                }
            } else {
                toast.error("Failed to load hospital details");
            }
        };

        if (id) {
            fetchHospital();
        }
    }, [id]);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                toast.error("Location permission denied");
            },
            { enableHighAccuracy: true }
        );
    }, []);

    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const hospitalDistance =
        userLocation && hospital?.location?.lat
            ? getDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  hospital.location.lat,
                  hospital.location.lng
              )
            : null;



    // Fetch all doctors and their queues
    const fetchDoctors = async (doctorIds) => {
        setLoadingDoctors(true);
        const today = new Date().toISOString().split("T")[0];

        try {
            // Fetch doctors
            const doctorPromises = doctorIds.map((doctorId) =>
                handleGetDoctorById(doctorId)
            );
            const doctorResults = await Promise.all(doctorPromises);
            const fetchedDoctors = doctorResults
                .filter((result) => result.success)
                .map((result) => result.data);
            setDoctors(fetchedDoctors);

            // Fetch queues for each doctor
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
            toast.error("Failed to load some doctor details");
        } finally {
            setLoadingDoctors(false);
        }
    };

    // Calculate bed statistics
    const getBedStats = () => {
        if (!hospital?.beds || hospital.beds.length === 0) {
            return null;
        }

        const total = hospital.beds.length;
        const available = hospital.beds.filter(
            (b) => b.status === "available"
        ).length;
        const occupied = hospital.beds.filter(
            (b) => b.status === "occupied"
        ).length;
        const reserved = hospital.beds.filter(
            (b) => b.status === "reserved"
        ).length;
        const utilization =
            total > 0 ? Math.round((occupied / total) * 100) : 0;

        const byType = {
            general: hospital.beds.filter((b) => b.type === "general").length,
            icu: hospital.beds.filter((b) => b.type === "icu").length,
            emergency: hospital.beds.filter((b) => b.type === "emergency")
                .length,
            vip: hospital.beds.filter((b) => b.type === "vip").length,
        };

        return { total, available, occupied, reserved, utilization, byType };
    };

    const bedStats = hospital ? getBedStats() : null;

    const getInitials = (name) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Loading state
    if (hospitalLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-24 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Loading hospital details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (!hospital) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-16 max-w-2xl mx-auto text-center">
                    <Building2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                        Hospital not found
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        The hospital you're looking for doesn't exist or has
                        been removed.
                    </p>
                    <Button
                        onClick={() => navigate("/hospitals")}
                        variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Hospitals
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
                        {/* Hospital Image */}
                        {/* Hospital Image Gallery */}
                        <div className="lg:col-span-3">
                            {hospital.photo && hospital.photo.length > 0 ? (
                                <div className="relative group">
                                    <Swiper
                                        modules={[
                                            Navigation,
                                            Pagination,
                                            Autoplay,
                                            EffectFade,
                                        ]}
                                        spaceBetween={0}
                                        slidesPerView={1}
                                        navigation={{
                                            nextEl: ".swiper-button-next-custom",
                                            prevEl: ".swiper-button-prev-custom",
                                        }}
                                        pagination={{
                                            clickable: true,
                                            dynamicBullets: true,
                                        }}
                                        autoplay={{
                                            delay: 4000,
                                            disableOnInteraction: false,
                                            pauseOnMouseEnter: true,
                                        }}
                                        effect="fade"
                                        fadeEffect={{ crossFade: true }}
                                        loop={hospital.photo.length > 1}
                                        className="rounded-xl overflow-hidden border shadow-sm h-[420px]">
                                        {hospital.photo.map((photo, index) => (
                                            <SwiperSlide key={index}>
                                                <img
                                                    src={photo}
                                                    alt={`${
                                                        hospital.name
                                                    } - Image ${index + 1}`}
                                                    className="w-full h-[420px] object-cover"
                                                />
                                            </SwiperSlide>
                                        ))}

                                        {/* Custom Navigation Buttons */}
                                        {hospital.photo.length > 1 && (
                                            <>
                                                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5 text-gray-700 dark:text-gray-200">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 19.5L8.25 12l7.5-7.5"
                                                        />
                                                    </svg>
                                                </button>
                                                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2.5}
                                                        stroke="currentColor"
                                                        className="w-5 h-5 text-gray-700 dark:text-gray-200">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </Swiper>

                                    {/* Image Counter Badge */}
                                    {hospital.photo.length > 1 && (
                                        <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                />
                                            </svg>
                                            {hospital.photo.length} Photos
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-[420px] bg-muted/50 rounded-xl border flex items-center justify-center">
                                    <Building2 className="h-20 w-20 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>

                        {/* Hospital Info */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Name & Rating */}
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">
                                    {hospital.name}
                                </h1>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md border border-amber-200/50 dark:border-amber-800/30">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold text-sm">
                                            {hospital.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {hospital.ratingCount} reviews
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="text-sm space-y-1">
                                    {hospital.address && (
                                        <p className="text-foreground">
                                            {hospital.address}
                                        </p>
                                    )}
                                    <p className="text-muted-foreground font-medium">
                                        {hospital.city}
                                    </p>

                                    {hospitalDistance !== null && (
                                        <p className="text-purple-600 font-semibold flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {hospitalDistance.toFixed(1)} km
                                            from your location
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Specialities */}
                            {hospital.specialities &&
                                hospital.specialities.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                            Specializations
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {hospital.specialities
                                                .slice(0, 4)
                                                .map((spec, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-xs font-normal">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                            {hospital.specialities.length >
                                                4 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs">
                                                    +
                                                    {hospital.specialities
                                                        .length - 4}{" "}
                                                    more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Contact Buttons */}
                            <div className="space-y-2.5 pt-2">
                                {hospital.contacts?.phone &&
                                    hospital.contacts.phone[0] && (
                                        <Button
                                            className="w-full justify-start"
                                            onClick={() =>
                                                (window.location.href = `tel:${hospital.contacts.phone[0]}`)
                                            }>
                                            <Phone className="h-4 w-4 mr-2" />
                                            Call {hospital.contacts.phone[0]}
                                        </Button>
                                    )}
                                {hospital.contacts?.email &&
                                    hospital.contacts.email[0] && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() =>
                                                (window.location.href = `mailto:${hospital.contacts.email[0]}`)
                                            }>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Email
                                        </Button>
                                    )}
                                {hospital.contacts?.emergency &&
                                    hospital.contacts.emergency[0] && (
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-start">
                                            <Phone className="h-4 w-4 mr-2" />
                                            Emergency:{" "}
                                            {hospital.contacts.emergency[0]}
                                        </Button>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    {/* Bed Availability Section */}
                    {bedStats && (
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                    <Bed className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Bed Availability
                                </h2>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card className="p-5 border-l-4 border-l-primary">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Total Beds
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {bedStats.total}
                                    </p>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-success">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Available
                                    </p>
                                    <p className="text-3xl font-bold text-success">
                                        {bedStats.available}
                                    </p>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-orange-500">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Occupied
                                    </p>
                                    <p className="text-3xl font-bold text-orange-500">
                                        {bedStats.occupied}
                                    </p>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-blue-500">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Utilization
                                    </p>
                                    <p className="text-3xl font-bold text-blue-500">
                                        {bedStats.utilization}%
                                    </p>
                                </Card>
                            </div>

                            <Card className="p-5">
                                <p className="text-sm font-medium text-muted-foreground mb-4">
                                    Bed Types
                                </p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            General
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {bedStats.byType.general}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            ICU
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {bedStats.byType.icu}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Emergency
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {bedStats.byType.emergency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            VIP
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {bedStats.byType.vip}
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/bed-booking/${hospital._id}`}>
                                    <Button className="w-full" size="lg">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Book a Bed
                                    </Button>
                                </Link>
                            </Card>
                        </section>
                    )}

                    {/* Doctors Section with Queue */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                    <Stethoscope className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Our Doctors & Live Queues
                                </h2>
                                <Badge
                                    variant="secondary"
                                    className="font-normal">
                                    {doctors.length}
                                </Badge>
                            </div>
                        </div>

                        {loadingDoctors ? (
                            <div className="text-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Loading doctors...
                                </p>
                            </div>
                        ) : doctors.length > 0 ? (
                            <div className="space-y-6">
                                {doctors.map((doctor) => {
                                    const queue = doctorQueues[doctor._id];

                                    return (
                                        <Card
                                            key={doctor._id}
                                            className="overflow-hidden hover:border-primary/50 transition-colors">
                                            <div className="grid md:grid-cols-5 gap-0">
                                                {/* Doctor Info */}
                                                <div className="md:col-span-3 p-6">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="h-16 w-16 border-2 border-background shadow-md">
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

                                                        <div className="flex-1">
                                                            <Link
                                                                to={`/doctor/${doctor._id}`}
                                                                className="hover:underline">
                                                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                                                    {
                                                                        doctor.name
                                                                    }
                                                                </h3>
                                                            </Link>
                                                            <Badge
                                                                variant="secondary"
                                                                className="mb-2">
                                                                {doctor.type}
                                                            </Badge>
                                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                                                                <span>
                                                                    {
                                                                        doctor.experience
                                                                    }{" "}
                                                                    years exp
                                                                </span>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                    <span>
                                                                        {doctor.averageRating.toFixed(
                                                                            1
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                className={
                                                                    doctor.currentStatus ===
                                                                    "available"
                                                                        ? "bg-success"
                                                                        : "bg-muted"
                                                                }>
                                                                {doctor.currentStatus ===
                                                                "available"
                                                                    ? "Available"
                                                                    : "Not Available"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Queue Status */}
                                                <div className="md:col-span-2 bg-muted/30 p-6 border-l">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Activity className="h-4 w-4 text-primary" />
                                                        <h4 className="font-semibold text-sm">
                                                            Today's Queue
                                                        </h4>
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
                                                                        ~
                                                                        {queue.averageConsultationTime ||
                                                                            15}{" "}
                                                                        min avg
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
                                                                No queue today
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="p-10 text-center border-dashed">
                                <Stethoscope className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground mb-1">
                                    No Doctors Available
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This hospital hasn't added any doctors yet
                                </p>
                            </Card>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetail;