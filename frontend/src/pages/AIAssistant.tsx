import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    BrainCircuit,
    Send,
    MapPin,
    Bed,
    Star,
    User,
    Bot,
    Loader2,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Sparkles,
    Phone,
    ArrowRight,
    Building2,
    Stethoscope,
    Plus,
    MessageSquare,
    Clock,
    Trash2,
    History,
    UserCircle,
    Sliders,
} from "lucide-react";
import { useGeminiAI } from "@/hooks/useGeminiAI";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Message {
    id: string;
    type: "user" | "ai";
    content: string;
    analysis?: any;
    timestamp: Date;
}

const STORAGE_KEY = "ai_assistant_messages";
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const AIAssistant = () => {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const {
        analyzeHealthQuery,
        cachedResults,
        conversationHistory,
        clearCache,
        clearConversation,
        sortPreference,
        updateSortPreference,
        loading,
    } = useGeminiAI();
    const { handleGetHospitals } = useHospitalActions();
    const { handleGetDoctors } = useDoctorActions();
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages from localStorage on mount
    useEffect(() => {
        const loadMessagesFromStorage = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const { messages: storedMessages, timestamp } =
                        JSON.parse(stored);
                    const now = new Date().getTime();

                    // Check if data is still valid (within 1 day)
                    if (now - timestamp < EXPIRY_TIME) {
                        // Convert timestamp strings back to Date objects
                        const parsedMessages = storedMessages.map(
                            (msg: any) => ({
                                ...msg,
                                timestamp: new Date(msg.timestamp),
                            })
                        );
                        setMessages(parsedMessages);
                        console.log(
                            `Restored ${parsedMessages.length} messages from localStorage`
                        );
                    } else {
                        // Data expired, clear it
                        localStorage.removeItem(STORAGE_KEY);
                        console.log(
                            "Stored messages expired, cleared localStorage"
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Error loading messages from localStorage:",
                    error
                );
                localStorage.removeItem(STORAGE_KEY);
            }
        };

        loadMessagesFromStorage();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Location not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                toast.success("Location detected 📍");
            },
            () => {
                toast.error("Please enable location to find nearest hospitals");
            },
            { enableHighAccuracy: true }
        );
    }, []);


    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try {
                const dataToStore = {
                    messages: messages,
                    timestamp: new Date().getTime(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
            } catch (error) {
                console.error("Error saving messages to localStorage:", error);
            }
        }
    }, [messages]);

    // Fetch hospitals and doctors data
    useEffect(() => {
        const fetchData = async () => {
            const [hospitalsRes, doctorsRes] = await Promise.all([
                handleGetHospitals(),
                handleGetDoctors(),
            ]);

            if (hospitalsRes.success && userLocation) {
                const enrichedHospitals = hospitalsRes.data.map((h: any) => ({
                    ...h,
                    distance: getDistanceKm(
                        userLocation.lat,
                        userLocation.lng,
                        h.location.lat,
                        h.location.lng
                    ),
                }));

                enrichedHospitals.sort(
                    (a, b) => a.distance - b.distance
                );
                setHospitals(enrichedHospitals);
            }

            if (doctorsRes.success) {
                setDoctors(doctorsRes.data);
            }
        };

        if (userLocation) fetchData();
    }, [userLocation]);


    // Auto-scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isAnalyzing) return;
        if (hospitals.length === 0 || doctors.length === 0) {
            toast.error("Loading healthcare data...");
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: input,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsAnalyzing(true);

        const userCity = profile?.address?.split(",").pop()?.trim() ?? null;
        const userLocationData = userLocation;

        const result = await analyzeHealthQuery(
            input,
            hospitals,
            doctors,
            userLocationData,
            userCity,
            profile
        );

        if (result.success) {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: "ai",
                content: result.data.analysis,
                analysis: result.data,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);

            if (profile) {
                toast.success(
                    `Personalized for ${profile.name}, ${profile.age}y · ${profile.address}`
                );
            }
        } else {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "ai",
                content:
                    "Sorry, I encountered an error analyzing your query. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            toast.error(result.error);
        }

        setIsAnalyzing(false);
    };

    function getDistanceKm(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }


    const handleClearConversation = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
        clearConversation();
        toast.success("Conversation cleared");
    };

    const handleClearAllCache = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
        clearCache();
        toast.success("All data and history cleared");
    };

    const quickPrompts = [
        "Find cardiologist with 10+ years experience",
        "Hospital with emergency beds available near me",
        "Pediatrician for child vaccination",
        "Orthopedic surgeon for knee pain treatment",
    ];

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "emergency":
                return "bg-red-100 text-red-800 border-red-300";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "low":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <BrainCircuit className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    AI Assistant
                                </h1>
                                <p className="text-xs text-gray-500">
                                    Healthcare Intelligence
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={handleClearConversation}>
                            <Plus className="h-4 w-4" />
                            New Conversation
                        </Button>
                    </div>

                    {/* Patient Profile Info */}
                    {profile && (
                        <div className="p-4 border-b border-gray-200 bg-blue-50">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <UserCircle className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                        {profile.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {profile.age}y • {profile.gender} •{" "}
                                        {profile.bloodGroup}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                        📍 {profile.address}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                    Personalized recommendations enabled
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-medium text-gray-600">
                                        Hospitals
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">
                                    {hospitals.length}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-medium text-gray-600">
                                        Doctors
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">
                                    {doctors.length}
                                </p>
                            </div>
                        </div>

                        {conversationHistory &&
                            conversationHistory.length > 0 && (
                                <div className="mt-3 p-2 bg-purple-50 rounded-lg flex items-center gap-2">
                                    <History className="h-4 w-4 text-purple-600" />
                                    <span className="text-xs text-purple-700">
                                        {conversationHistory.length}{" "}
                                        conversations saved
                                    </span>
                                </div>
                            )}
                    </div>

                    {/* Sort Preferences */}
                    <div className="p-6 border-b border-gray-200">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 w-full">
                            <Sliders className="h-4 w-4" />
                            Sorting Preferences
                            <span className="ml-auto text-gray-400">
                                {showSettings ? "−" : "+"}
                            </span>
                        </button>

                        {showSettings && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600 flex justify-between mb-1">
                                        <span>Distance Priority</span>
                                        <span className="font-medium">
                                            {sortPreference.distance.toFixed(1)}
                                            x
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={sortPreference.distance}
                                        onChange={(e) =>
                                            updateSortPreference({
                                                distance: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 flex justify-between mb-1">
                                        <span>Cost Priority</span>
                                        <span className="font-medium">
                                            {sortPreference.cost.toFixed(1)}x
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={sortPreference.cost}
                                        onChange={(e) =>
                                            updateSortPreference({
                                                cost: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 flex justify-between mb-1">
                                        <span>Rating Priority</span>
                                        <span className="font-medium">
                                            {sortPreference.rating.toFixed(1)}x
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={sortPreference.rating}
                                        onChange={(e) =>
                                            updateSortPreference({
                                                rating: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-600 flex justify-between mb-1">
                                        <span>Bed Availability</span>
                                        <span className="font-medium">
                                            {sortPreference.beds.toFixed(1)}x
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={sortPreference.beds}
                                        onChange={(e) =>
                                            updateSortPreference({
                                                beds: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Capabilities */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            What I can help with
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center">
                                        <BrainCircuit className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Smart Analysis
                                    </h4>
                                </div>
                                <ul className="ml-8 space-y-1 text-xs text-gray-600">
                                    <li>• Understand your symptoms</li>
                                    <li>• Detect medical specialty needed</li>
                                    <li>• Assess urgency level</li>
                                </ul>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded bg-purple-100 flex items-center justify-center">
                                        <TrendingUp className="h-3 w-3 text-purple-600" />
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Personalized Match
                                    </h4>
                                </div>
                                <ul className="ml-8 space-y-1 text-xs text-gray-600">
                                    <li>• Age-appropriate specialists</li>
                                    <li>• Location-based recommendations</li>
                                    <li>• Blood type compatibility</li>
                                </ul>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Smart Rankings
                                    </h4>
                                </div>
                                <ul className="ml-8 space-y-1 text-xs text-gray-600">
                                    <li>• Multi-factor scoring</li>
                                    <li>• Real-time availability</li>
                                    <li>• Cost optimization</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAllCache}
                            className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-3 w-3" />
                            Clear All History
                        </Button>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Powered by Gemini AI</span>
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {messages.length === 0
                                    ? "Start a new conversation"
                                    : `${messages.length} messages`}
                            </span>
                        </div>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearConversation}
                                className="text-xs">
                                Clear chat
                            </Button>
                        )}
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto">
                        {messages.length === 0 ? (
                            // Empty State
                            <div className="h-full flex items-center justify-center p-8">
                                <div className="max-w-2xl w-full space-y-8">
                                    <div className="text-center space-y-3">
                                        <div className="inline-flex h-16 w-16 rounded-2xl bg-blue-600 items-center justify-center mb-2">
                                            <BrainCircuit className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-gray-900">
                                            How can I help you today
                                            {profile ? `, ${profile.name}` : ""}
                                            ?
                                        </h2>
                                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                                            Describe your symptoms or tell me
                                            what kind of medical care you're
                                            looking for
                                            {profile &&
                                                ` • Personalized for ${profile.age}y ${profile.gender}`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {quickPrompts.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setInput(prompt)}
                                                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group">
                                                <Sparkles className="h-4 w-4 text-gray-400 group-hover:text-blue-600 mb-2" />
                                                <p className="text-sm text-gray-700 group-hover:text-gray-900">
                                                    {prompt}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Messages
                            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                                {messages.map((message) => (
                                    <div key={message.id} className="space-y-4">
                                        {/* Message */}
                                        <div
                                            className={`flex gap-4 ${
                                                message.type === "user"
                                                    ? "justify-end"
                                                    : ""
                                            }`}>
                                            {message.type === "ai" && (
                                                <Avatar className="h-8 w-8 border border-gray-200">
                                                    <AvatarFallback className="bg-blue-600">
                                                        <Bot className="h-4 w-4 text-white" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}

                                            <div
                                                className={`flex-1 max-w-3xl ${
                                                    message.type === "user"
                                                        ? "flex justify-end"
                                                        : ""
                                                }`}>
                                                <div
                                                    className={`rounded-lg p-4 ${
                                                        message.type === "user"
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-900"
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                </div>

                                                {/* Analysis Results */}
                                                {message.analysis && (
                                                    <div className="mt-4 space-y-4">
                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge
                                                                className={`${getUrgencyColor(
                                                                    message
                                                                        .analysis
                                                                        .urgency
                                                                )} border font-medium`}>
                                                                {message.analysis.urgency.toUpperCase()}
                                                            </Badge>
                                                            {message.analysis
                                                                .recommendedSpecialty && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    {
                                                                        message
                                                                            .analysis
                                                                            .recommendedSpecialty
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* EMERGENCY: Show hospitals FIRST and ONLY for emergency/high urgency */}
                                                        {message.analysis
                                                            .urgency ===
                                                            "emergency" ||
                                                        message.analysis
                                                            .urgency ===
                                                            "high" ? (
                                                            <>
                                                                {/* Hospitals - PRIMARY for emergencies */}
                                                                {message
                                                                    .analysis
                                                                    .hospitals
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
                                                                            <Building2 className="h-4 w-4" />
                                                                            🚨
                                                                            Emergency
                                                                            Hospitals
                                                                            Near
                                                                            You
                                                                        </h4>
                                                                        {message.analysis.hospitals.map(
                                                                            (
                                                                                hospital: any
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        hospital._id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/hospital/${hospital._id}`
                                                                                        )
                                                                                    }
                                                                                    className="p-4 border-2 border-red-300 bg-red-50 rounded-lg hover:border-red-600 hover:shadow-lg transition-all cursor-pointer group">
                                                                                    <div className="flex items-start justify-between mb-3">
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <h5 className="font-bold text-gray-900 group-hover:text-red-600">
                                                                                                    {
                                                                                                        hospital.name
                                                                                                    }
                                                                                                </h5>
                                                                                                {hospital.availableBeds >
                                                                                                    0 && (
                                                                                                    <Badge className="bg-green-600 text-white">
                                                                                                        {
                                                                                                            hospital.availableBeds
                                                                                                        }{" "}
                                                                                                        Beds
                                                                                                        Available
                                                                                                    </Badge>
                                                                                                )}
                                                                                                {hospital.averageRating >
                                                                                                    0 && (
                                                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-md">
                                                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                                                        <span className="text-xs font-medium text-yellow-700">
                                                                                                            {hospital.averageRating.toFixed(
                                                                                                                1
                                                                                                            )}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className="text-xs text-red-700 font-medium mb-2">
                                                                                                {
                                                                                                    hospital.reason
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-2 text-xs text-gray-600">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <MapPin className="h-3 w-3 text-red-600" />
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    hospital.address
                                                                                                }

                                                                                                ,{" "}
                                                                                                {
                                                                                                    hospital.city
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                        {hospital.distance !==
                                                                                            null &&
                                                                                            hospital.distance !==
                                                                                                undefined && (
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <MapPin className="h-3 w-3 text-purple-600" />
                                                                                                    <span className="text-purple-600 font-bold">
                                                                                                        {hospital.distance.toFixed(
                                                                                                            1
                                                                                                        )}{" "}
                                                                                                        km
                                                                                                        away
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Bed className="h-3 w-3 text-green-600" />
                                                                                            <span className="text-green-600 font-medium">
                                                                                                {hospital.beds?.filter(
                                                                                                    (
                                                                                                        b: any
                                                                                                    ) =>
                                                                                                        b.status ===
                                                                                                        "available"
                                                                                                )
                                                                                                    .length ||
                                                                                                    0}{" "}
                                                                                                beds
                                                                                                available
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-200">
                                                                                        {hospital
                                                                                            .contacts
                                                                                            ?.emergency?.[0] && (
                                                                                            <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
                                                                                                <Phone className="h-4 w-4" />
                                                                                                Emergency:{" "}
                                                                                                {
                                                                                                    hospital
                                                                                                        .contacts
                                                                                                        .emergency[0]
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-transform ml-auto" />
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Advice for emergencies */}
                                                                {message
                                                                    .analysis
                                                                    .additionalAdvice && (
                                                                    <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg">
                                                                        <div className="flex gap-2">
                                                                            <AlertCircle className="h-5 w-5 text-red-700 mt-0.5 flex-shrink-0" />
                                                                            <div>
                                                                                <p className="text-sm font-bold text-red-900 mb-1">
                                                                                    ⚠️
                                                                                    EMERGENCY
                                                                                    INSTRUCTIONS
                                                                                </p>
                                                                                <p className="text-sm text-red-800 font-medium">
                                                                                    {
                                                                                        message
                                                                                            .analysis
                                                                                            .additionalAdvice
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            /* NORMAL FLOW: Show doctors first for non-emergencies */
                                                            <>
                                                                {/* Doctors */}
                                                                {message
                                                                    .analysis
                                                                    .doctors
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                                            <Stethoscope className="h-4 w-4" />
                                                                            Recommended
                                                                            Doctors
                                                                        </h4>
                                                                        {message.analysis.doctors.map(
                                                                            (
                                                                                doctor: any
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        doctor._id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/doctor/${doctor._id}`
                                                                                        )
                                                                                    }
                                                                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer group">
                                                                                    <div className="flex items-start justify-between mb-2">
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                                                                                    {
                                                                                                        doctor.name
                                                                                                    }
                                                                                                </h5>
                                                                                                {doctor.currentStatus ===
                                                                                                    "available" && (
                                                                                                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                                                                                        Available
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className="text-xs text-gray-600">
                                                                                                {
                                                                                                    doctor.type
                                                                                                }{" "}
                                                                                                •{" "}
                                                                                                {
                                                                                                    doctor.experience
                                                                                                }{" "}
                                                                                                years
                                                                                                exp
                                                                                            </p>
                                                                                            <p className="text-xs text-blue-600 mt-1">
                                                                                                {
                                                                                                    doctor.reason
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <span>
                                                                                                ₹
                                                                                                {
                                                                                                    doctor.fee
                                                                                                }
                                                                                            </span>
                                                                                            <span>
                                                                                                📍{" "}
                                                                                                {
                                                                                                    doctor.city
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Hospitals - SECONDARY for non-emergencies */}
                                                                {message
                                                                    .analysis
                                                                    .hospitals
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="space-y-3">
                                                                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                                            <Building2 className="h-4 w-4" />
                                                                            Recommended
                                                                            Hospitals
                                                                        </h4>
                                                                        {message.analysis.hospitals.map(
                                                                            (
                                                                                hospital: any
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        hospital._id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/hospital/${hospital._id}`
                                                                                        )
                                                                                    }
                                                                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer group">
                                                                                    <div className="flex items-start justify-between mb-3">
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <h5 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                                                                                    {
                                                                                                        hospital.name
                                                                                                    }
                                                                                                </h5>
                                                                                                {hospital.averageRating >
                                                                                                    0 && (
                                                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-md">
                                                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                                                        <span className="text-xs font-medium text-yellow-700">
                                                                                                            {hospital.averageRating.toFixed(
                                                                                                                1
                                                                                                            )}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className="text-xs text-blue-600 mb-2">
                                                                                                {
                                                                                                    hospital.reason
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-2 text-xs text-gray-600">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <MapPin className="h-3 w-3" />
                                                                                            <span>
                                                                                                {
                                                                                                    hospital.address
                                                                                                }

                                                                                                ,{" "}
                                                                                                {
                                                                                                    hospital.city
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Bed className="h-3 w-3 text-green-600" />
                                                                                            <span className="text-green-600 font-medium">
                                                                                                {hospital.beds?.filter(
                                                                                                    (
                                                                                                        b: any
                                                                                                    ) =>
                                                                                                        b.status ===
                                                                                                        "available"
                                                                                                )
                                                                                                    .length ||
                                                                                                    0}{" "}
                                                                                                beds
                                                                                                available
                                                                                            </span>
                                                                                        </div>
                                                                                        {hospital.distance !==
                                                                                            null &&
                                                                                            hospital.distance !==
                                                                                                undefined && (
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <MapPin className="h-3 w-3 text-purple-600" />
                                                                                                    <span className="text-purple-600 font-medium">
                                                                                                        {hospital.distance.toFixed(
                                                                                                            1
                                                                                                        )}{" "}
                                                                                                        km
                                                                                                        away
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                    </div>

                                                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                                                        {hospital
                                                                                            .contacts
                                                                                            ?.emergency?.[0] && (
                                                                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                                                                <Phone className="h-3 w-3" />
                                                                                                {
                                                                                                    hospital
                                                                                                        .contacts
                                                                                                        .emergency[0]
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform ml-auto" />
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Advice */}
                                                                {message
                                                                    .analysis
                                                                    .additionalAdvice && (
                                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <div className="flex gap-2">
                                                                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                            <div>
                                                                                <p className="text-xs font-medium text-blue-900 mb-1">
                                                                                    Medical
                                                                                    Advice
                                                                                </p>
                                                                                <p className="text-xs text-blue-700">
                                                                                    {
                                                                                        message
                                                                                            .analysis
                                                                                            .additionalAdvice
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {message.timestamp.toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                            {message.type === "user" && (
                                                <Avatar className="h-8 w-8 border border-gray-200">
                                                    <AvatarFallback className="bg-gray-200">
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading */}
                                {isAnalyzing && (
                                    <div className="flex gap-4">
                                        <Avatar className="h-8 w-8 border border-gray-200">
                                            <AvatarFallback className="bg-blue-600">
                                                <Bot className="h-4 w-4 text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-gray-100 rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">
                                                    Analyzing
                                                    {profile
                                                        ? ` for ${profile.name}`
                                                        : ""}
                                                    ...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 lg:px-6 lg:pb-6">
                        <div className="flex gap-2 max-w-4xl mx-auto">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    handleSend()
                                }
                                placeholder={
                                    isAnalyzing
                                        ? "Analyzing..."
                                        : "Describe your symptoms or medical needs..."
                                }
                                className="flex-1 min-h-[44px] lg:min-h-0"
                                disabled={isAnalyzing}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isAnalyzing}
                                className="h-11 lg:h-auto w-11 lg:w-auto flex-shrink-0"
                                size="icon"
                                variant="default">
                                {isAnalyzing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;