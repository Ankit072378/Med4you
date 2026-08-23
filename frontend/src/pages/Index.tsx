import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    MapPin,
    Stethoscope,
    User,
    Hospital,
    Users,
    Clock,
    ShieldCheck,
    BrainCircuit,
    FileText,
    AlertTriangle,
    Bell,
    Settings,
    Phone,
} from "lucide-react";
import heroImage from "@/assets/Med4UHeroImage.jpeg";
import { useEmergencyActions } from "@/hooks/useEmergencyActions";

const Index = () => {
    const [searchType, setSearchType] = useState("location");
    const [searchQuery, setSearchQuery] = useState("");
    const [sosClickCount, setSosClickCount] = useState(0);
    // const [showSOSConfirm, setShowSOSConfirm] = useState(false);
    const [userLocation, setUserLocation] = useState("");
    const [showEmergencyTooltip, setShowEmergencyTooltip] = useState(false);
    const navigate = useNavigate();
    const { handleTriggerEmergency, loading: sosLoading } =
        useEmergencyActions();

    const handleSOSClick = useCallback(async () => {
        setSosClickCount((prev) => {
            const newCount = prev + 1;

            if (newCount === 3) {
                triggerSOS(); // 🚨 CALL API IMMEDIATELY
                return 0;
            }

            setTimeout(() => setSosClickCount(0), 3000);
            return newCount;
        });
    }, []);

    const triggerSOS = async () => {
        try {
            const location = await getCurrentLocation();
            await handleTriggerEmergency(location);

            // Optional: toast / banner
            alert("🚨 SOS sent. Help is on the way.");
        } catch (err) {
            alert("Failed to send SOS. Try again.");
        }
    };


    const getCurrentLocation = useCallback(() => {
        return new Promise<string>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = `${position.coords.latitude},${position.coords.longitude}`;
                    resolve(location);
                },
                (error) => {
                    reject(error);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        });
    }, []);

    // const confirmAndSendSOS = useCallback(async () => {
    //     try {
    //         const location = await getCurrentLocation();
    //         setUserLocation(location);

    //         const result = await handleTriggerEmergency(location);
    //         if (result.success) {
    //             alert(
    //                 "🚨 Emergency alert sent to your contacts! Help is on the way."
    //             );
    //             setShowSOSConfirm(false);
    //         }
    //     } catch (error: any) {
    //         console.error("SOS failed:", error);
    //         alert("Failed to send emergency alert. Please try again.");
    //         setShowSOSConfirm(false);
    //     }
    // }, [getCurrentLocation, handleTriggerEmergency]);

    // const cancelSOS = () => {
    //     setShowSOSConfirm(false);
    //     setSosClickCount(0);
    // };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (searchType === "doctor") {
                navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
            } else {
                navigate(
                    `/hospitals?type=${searchType}&search=${encodeURIComponent(
                        searchQuery
                    )}`
                );
            }
        }
    };

    // Reset SOS counter on page unload
    useEffect(() => {
        return () => setSosClickCount(0);
    }, []);

    // Updated 9 features with Emergency, Notifications, and Management
    const features = [
        {
            icon: Hospital,
            title: "Hospital Search",
            description:
                "Find hospitals by city, disease, or doctor name across India",
        },
        {
            icon: Users,
            title: "Live Patient Monitoring",
            description:
                "Monitor patients remotely with secure camera access for families",
        },
        {
            icon: Clock,
            title: "Queue Tracking",
            description:
                "Real-time doctor availability and patient queue information",
        },
        {
            icon: FileText,
            title: "Medical History",
            description:
                "Complete timeline of treatments, tests, and prescriptions",
        },
        {
            icon: BrainCircuit,
            title: "AI Assistant",
            description:
                "Smart recommendations for hospitals, doctors, and emergency care",
        },
        {
            icon: ShieldCheck,
            title: "Secure & Private",
            description:
                "Your medical data protected with controlled doctor access",
        },
        {
            icon: AlertTriangle,
            title: "Emergency SOS",
            description:
                "3-tap emergency button instantly alerts contacts with GPS location",
            isNew: true,
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description:
                "Real-time alerts for appointments, queue updates, and emergencies",
            isNew: true,
        },
        {
            icon: Settings,
            title: "Doctor/Hospital Management",
            description:
                "Complete dashboard for managing patients, schedules, and reports",
            isNew: true,
        },
    ];

    return (
        <div className="min-h-screen bg-background relative">
            <Navbar />

            {/* 🆕 FIXED EMERGENCY BUTTON with Hover Tooltip */}
            <div className="fixed bottom-6 right-6 z-50 group">
                {/* Mobile: Large FAB */}
                <div className="block md:hidden">
                    <Button
                        size="lg"
                        className={`w-20 h-20 rounded-full shadow-2xl border-4 border-white/80 backdrop-blur-sm relative group-hover:scale-110 active:scale-95 transition-all duration-300 ${
                            sosLoading
                                ? "bg-gray-400"
                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/50"
                        }`}
                        onClick={handleSOSClick}
                        onMouseEnter={() => setShowEmergencyTooltip(true)}
                        onMouseLeave={() => setShowEmergencyTooltip(false)}
                        disabled={sosLoading}>
                        {sosClickCount === 0 ? (
                            <AlertTriangle className="w-7 h-7" />
                        ) : (
                            <span className="text-lg font-bold text-white">
                                {sosClickCount}
                            </span>
                        )}

                        {/* Mobile Tooltip */}
                        {showEmergencyTooltip && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Tap 3 times for SOS
                            </div>
                        )}
                    </Button>
                </div>

                {/* Desktop: Smaller button */}
                <div className="hidden md:block">
                    <Button
                        size="lg"
                        className={`w-16 h-16 rounded-full shadow-xl border-3 border-white/80 backdrop-blur-sm p-0 relative group-hover:scale-110 active:scale-95 transition-all duration-300 ${
                            sosLoading
                                ? "bg-gray-400"
                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/50"
                        }`}
                        onClick={handleSOSClick}
                        onMouseEnter={() => setShowEmergencyTooltip(true)}
                        onMouseLeave={() => setShowEmergencyTooltip(false)}
                        disabled={sosLoading}>
                        {sosClickCount === 0 ? (
                            <AlertTriangle className="w-6 h-6" />
                        ) : (
                            <span className="text-sm font-bold text-white">
                                {sosClickCount}
                            </span>
                        )}

                        {/* Desktop Tooltip */}
                        {showEmergencyTooltip && (
                            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-4 py-2 rounded-xl shadow-2xl z-10 whitespace-nowrap font-medium border border-white/20">
                                🔴 Emergency SOS
                                <br />
                                <span className="text-red-100 text-[10px] font-normal">
                                    Click 3 times rapidly
                                </span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* 🆕 SOS Confirmation Modal */}
            {/* {showSOSConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <AlertTriangle className="w-14 h-14 text-red-500" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                Confirm Emergency Alert
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                You've clicked SOS 3 times. Are you in an
                                emergency?
                                <br />
                                <span className="font-semibold text-red-600">
                                    This will notify your emergency contacts
                                    with your location.
                                </span>
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100 rounded-2xl p-6 mb-8">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Live Location Shared
                                    </p>
                                    <p className="text-gray-600">
                                        GPS coordinates will be sent
                                        automatically
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-14 text-lg rounded-xl"
                                onClick={cancelSOS}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-red-500/25 transition-all duration-300"
                                onClick={confirmAndSendSOS}
                                disabled={sosLoading}>
                                {sosLoading ? "Sending..." : "🚨 SEND SOS NOW"}
                            </Button>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Hero Section - CLEAN without SOS clutter */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background z-0" />
                <div className="container relative z-10 py-12 md:py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-block">
                                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    Healthcare Made Simple
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                                Your Complete Healthcare
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {" "}
                                    Platform
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-xl">
                                Search hospitals nationwide, monitor patients
                                remotely, track queues, and get AI-powered
                                healthcare recommendations - all in one place.
                            </p>

                            <form
                                onSubmit={handleSearch}
                                className="max-w-xl pt-4">
                                <Tabs
                                    value={searchType}
                                    onValueChange={(value) =>
                                        setSearchType(value)
                                    }
                                    className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger
                                            value="location"
                                            className="gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Location
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="disease"
                                            className="gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            Disease
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="doctor"
                                            className="gap-2">
                                            <User className="w-4 h-4" />
                                            Doctor
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder={
                                                searchType === "location"
                                                    ? "Enter city name (e.g., Delhi, Mumbai)"
                                                    : searchType === "disease"
                                                    ? "Enter disease or condition"
                                                    : "Enter doctor's name"
                                            }
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-10 h-12 text-base"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 whitespace-nowrap">
                                        Search
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="relative flex justify-center items-center h-[450px] md:h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-60" />
                            <div
                                className="relative overflow-hidden shadow-2xl"
                                style={{
                                    height: "100%",
                                    width: "90%",
                                    maxWidth: "600px",
                                    borderTopLeftRadius: "50%",
                                    borderBottomLeftRadius: "50%",
                                    marginLeft: "auto",
                                    backgroundImage: `url(${heroImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 🆕 UPDATED Features Section - 9 Features in 3x3 Grid */}
            <section className="py-16 bg-muted/50">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Complete Healthcare Solutions
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your healthcare
                            journey in one intelligent platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`bg-card rounded-xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border border-border group ${
                                    feature.isNew
                                        ? "ring-2 ring-primary/20"
                                        : ""
                                }`}>
                                <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${
                                        feature.isNew
                                            ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25"
                                            : "bg-gradient-to-br from-primary to-accent"
                                    }`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                                {feature.isNew && (
                                    <span className="inline-block mt-2 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                        NEW
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container">
                    <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Experience Better Healthcare?
                        </h2>
                        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                            Join thousands of patients who trust Med4You for
                            their healthcare needs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={() => navigate("/hospitals")}
                                className="text-primary hover:text-primary">
                                Find Hospitals
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate("/ai-assistant")}
                                className="border-white text-white bg-white/10">
                                Talk to AI Assistant
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
