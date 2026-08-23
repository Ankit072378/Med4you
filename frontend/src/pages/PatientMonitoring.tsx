import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Video,
    Clock,
    AlertCircle,
    Loader2,
    CheckCircle2,
    XCircle,
    Phone,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    LivestreamLayout,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const PatientMonitoring = () => {
    const [patientPhone, setPatientPhone] = useState("");
    const [patientData, setPatientData] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [videoClient, setVideoClient] = useState(null);
    const [call, setCall] = useState(null);
    const [fetchingPatient, setFetchingPatient] = useState(false);

    useEffect(() => {
        fetchHospitals();
        fetchUserRequests();
        checkActiveSession();
    }, []);

    useEffect(() => {
        let interval;
        if (activeSession && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        handleSessionEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSession, remainingTime]);

    const fetchPatientByPhone = async () => {
        if (!patientPhone || patientPhone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setFetchingPatient(true);
        try {
            const response = await axios.get(
                `${API_URL}/patient/${patientPhone}`
            );
            if (response.data.success) {
                setPatientData(response.data.patient);
                toast.success("Patient found!");
            } else {
                setPatientData(null);
                toast.error("Patient not found");
            }
        } catch (error) {
            setPatientData(null);
            toast.error(error.response?.data?.message || "Patient not found");
        } finally {
            setFetchingPatient(false);
        }
    };

    const fetchHospitals = async () => {
        try {
            const response = await axios.get(`${API_URL}/hospital`);
            setHospitals(response.data.data || []);
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        }
    };

    const fetchUserRequests = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/monitoring/user/requests`,
                {
                    withCredentials: true,
                }
            );
            setRequests(response.data.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const checkActiveSession = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/monitoring/active-session`,
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                const session = response.data.data;
                setActiveSession(session);
                setRemainingTime(session.remainingTime);

                await initializeVideoCall(
                    session.token,
                    session.callId,
                    session.apiKey,
                    session.userId
                );

            }
        } catch (error) {
            // No active session - this is normal
            if (error.response?.status !== 404) {
                console.error("Error checking session:", error);
            }
        }
    };

    const initializeVideoCall = async (token, callId, apiKey, userId) => {
        try {
            const client = new StreamVideoClient({
                apiKey,
                user: { id: userId },
                token,
            });

            setVideoClient(client);

            const newCall = client.call("livestream", callId);
            await newCall.join({ create: false });
            setCall(newCall);

            toast.success("Connected to video stream!");
        } catch (error) {
            console.error("Error initializing video call:", error);
            toast.error(error.message || "Failed to connect to video stream");
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();

        if (!patientData || !selectedHospital) {
            toast.error("Please select both patient and hospital");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/monitoring/request`,
                {
                    patientId: patientData._id,
                    hospitalId: selectedHospital,
                    reason,
                },
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                toast.success("Monitoring request sent successfully!");
                setPatientPhone("");
                setPatientData(null);
                setSelectedHospital("");
                setReason("");
                fetchUserRequests();
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Failed to send request";
            toast.error(errorMsg);
            console.error(
                "Submit error:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSessionEnd = async () => {
        if (call) {
            await call.leave();
        }
        if (videoClient) {
            await videoClient.disconnectUser();
        }
        setActiveSession(null);
        setRemainingTime(0);
        setCall(null);
        setVideoClient(null);
        toast.info("Monitoring session ended");
        fetchUserRequests();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { variant: "secondary", icon: Clock, text: "Pending" },
            accepted: {
                variant: "default",
                icon: CheckCircle2,
                text: "Accepted",
            },
            rejected: {
                variant: "destructive",
                icon: XCircle,
                text: "Rejected",
            },
            completed: {
                variant: "outline",
                icon: CheckCircle2,
                text: "Completed",
            },
        };

        const config = styles[status] || styles.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Patient Monitoring System
                        </h1>
                        <p className="text-muted-foreground">
                            Request to view your loved ones through secure
                            hospital cameras
                        </p>
                    </div>

                    {activeSession ? (
                        <div className="space-y-6">
                            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
                                            Live Monitoring Active
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {activeSession.patientId?.name} •{" "}
                                            {activeSession.hospitalId?.name}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">
                                            {formatTime(remainingTime)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Time Remaining
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black rounded-lg overflow-hidden mb-4">
                                    {videoClient && call ? (
                                        <StreamVideo client={videoClient}>
                                            <StreamCall call={call}>
                                                <LivestreamLayout />
                                            </StreamCall>
                                        </StreamVideo>
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center">
                                            <Loader2 className="h-12 w-12 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        <p>
                                            🔇 Audio Disabled • View Only Mode
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleSessionEnd}>
                                        End Session
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    New Monitoring Request
                                </h2>
                                <form
                                    onSubmit={handleSubmitRequest}
                                    className="space-y-4">
                                    <div>
                                        <Label>Patient Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="tel"
                                                placeholder="Enter 10-digit phone number"
                                                className="pl-10"
                                                value={patientPhone}
                                                onChange={(e) =>
                                                    setPatientPhone(
                                                        e.target.value
                                                    )
                                                }
                                                maxLength={10}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full"
                                            onClick={fetchPatientByPhone}
                                            disabled={
                                                fetchingPatient || !patientPhone
                                            }>
                                            {fetchingPatient ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Searching...
                                                </>
                                            ) : (
                                                "Find Patient"
                                            )}
                                        </Button>
                                    </div>

                                    {patientData && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {patientData.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patientData.age} years
                                                        • {patientData.gender}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setPatientData(null);
                                                    setPatientPhone("");
                                                }}
                                                className="text-xs">
                                                Change Patient
                                            </Button>
                                        </div>
                                    )}

                                    <div>
                                        <Label>Select Hospital</Label>
                                        <Select
                                            value={selectedHospital}
                                            onValueChange={setSelectedHospital}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose hospital" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hospitals.map((hospital) => (
                                                    <SelectItem
                                                        key={hospital._id}
                                                        value={hospital._id}>
                                                        {hospital.name} -{" "}
                                                        {hospital.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Reason (Optional)</Label>
                                        <Textarea
                                            placeholder="Why do you need to view the patient?"
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={
                                            loading ||
                                            !patientData ||
                                            !selectedHospital
                                        }>
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            <>
                                                <Video className="h-4 w-4 mr-2" />
                                                Send Request
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-medium text-foreground mb-1">
                                                How it works:
                                            </p>
                                            <ul className="space-y-1 list-disc list-inside">
                                                <li>
                                                    Enter patient phone number
                                                </li>
                                                <li>
                                                    Hospital receives your
                                                    request
                                                </li>
                                                <li>
                                                    Upon approval, 5-minute
                                                    session starts
                                                </li>
                                                <li>
                                                    View patient via camera
                                                    (audio disabled)
                                                </li>
                                                <li>
                                                    Session auto-ends after 5
                                                    minutes
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    Request History
                                </h2>
                                <div className="space-y-3">
                                    {requests.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">
                                                No requests yet
                                            </p>
                                        </div>
                                    ) : (
                                        requests.slice(0, 5).map((request) => (
                                            <Card
                                                key={request._id}
                                                className="p-4 bg-muted/30">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                request
                                                                    .patientId
                                                                    ?.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                request
                                                                    .hospitalId
                                                                    ?.name
                                                            }
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(
                                                        request.status
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        request.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientMonitoring;
