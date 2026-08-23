import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    StreamVideoClient,
    StreamVideo,
    StreamCall,
    LivestreamLayout,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Video,
    Clock,
    User,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const HospitalMonitoringRequests = ({ hospitalId }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [readyToStart, setReadyToStart] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [activeCall, setActiveCall] = useState(null);
    const [streamClient, setStreamClient] = useState(null);
    const [streamCall, setStreamCall] = useState(null);

    useEffect(() => {
        if (hospitalId) {
            fetchRequests();
        }
    }, [hospitalId]);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/monitoring/hospital/${hospitalId}/requests?status=pending`,
                {
                    withCredentials: true,
                }
            );
            setRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        setActionLoading(true);
        try {
            const response = await axios.patch(
                `${API_URL}/monitoring/request/${requestId}/accept`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                const { callId, hospitalToken, apiKey } = response.data.data;

                const hospitalUserId = `hospital_${hospitalId}`;
                const streamToken = hospitalToken;


                toast.success("Request accepted! Initializing video...");

                const client = new StreamVideoClient({
                    apiKey,
                    user: { id: hospitalUserId },
                    token: streamToken,
                });


                const call = client.call("livestream", callId);
                await call.join({ create: false });

                setStreamClient(client);
                setStreamCall(call);
                setActiveCall(response.data.data);
                setReadyToStart(true);

                await fetchRequests();
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Failed to accept request";
            toast.error(errorMsg);
            console.error(
                "Accept error:",
                error.response?.data || error.message
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            await axios.patch(
                `${API_URL}/monitoring/request/${selectedRequest._id}/reject`,
                { reason: rejectReason },
                {
                    withCredentials: true,
                }
            );

            toast.success("Request rejected");
            setShowRejectDialog(false);
            setRejectReason("");
            setSelectedRequest(null);
            await fetchRequests();
        } catch (error) {
            toast.error("Failed to reject request");
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectDialog = (request) => {
        setSelectedRequest(request);
        setShowRejectDialog(true);
    };

    const getInitials = (name) => {
        return (
            name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "PA"
        );
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">
                        Patient Monitoring Requests
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Family members requesting to view patients
                    </p>
                </div>
                <Badge variant="secondary">{requests.length} Pending</Badge>
            </div>

            {requests.length === 0 ? (
                <Card className="p-12 text-center">
                    <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                        No Pending Requests
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Monitoring requests will appear here when families
                        request access
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <Card
                            key={request._id}
                            className="p-5 hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <Avatar className="h-12 w-12 border-2">
                                        <AvatarImage
                                            src={
                                                request.patientId?.profilePhoto
                                            }
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                                            {getInitials(
                                                request.patientId?.name
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-foreground">
                                                {request.patientId?.name}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className="text-xs">
                                                {request.patientId?.age} yrs
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span>
                                                    {request.patientId?.gender}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatTimeAgo(
                                                        request.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {request.reason && (
                                            <p className="text-sm text-muted-foreground italic">
                                                "{request.reason}"
                                            </p>
                                        )}

                                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs font-medium text-foreground mb-1">
                                                Request Details:
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                • Family member wants to view
                                                patient via camera
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                • Access duration: 5 minutes
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                • Audio disabled (view only)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleAcceptRequest(request._id)
                                        }
                                        disabled={actionLoading}
                                        className="bg-green-600 hover:bg-green-700">
                                        {actionLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Accept
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            openRejectDialog(request)
                                        }
                                        disabled={actionLoading}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Monitoring Request</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this monitoring
                            request (optional)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Patient is sleeping, Not appropriate at this time..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-2"
                            rows={4}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectReason("");
                                setSelectedRequest(null);
                            }}
                            disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectRequest}
                            disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Active Call Notification */}
            {activeCall && (
                <Card className="p-4 bg-green-50 border-green-200 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-green-600 animate-pulse" />
                        <div>
                            <p className="font-semibold text-green-900">
                                Monitoring Session Ready
                            </p>
                            <p className="text-sm text-green-700">
                                Click below to start camera
                            </p>
                        </div>
                    </div>

                    {readyToStart && streamCall && (
                        <Button
                            onClick={async () => {
                                try {
                                    await streamCall.camera.enable();
                                    await streamCall.microphone.disable();
                                    toast.success("Camera is now live!");
                                    setReadyToStart(false);
                                } catch (error) {
                                    toast.error("Failed to start camera");
                                    console.error("Camera error:", error);
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700">
                            <Video className="h-4 w-4 mr-2" />
                            Start Camera
                        </Button>
                    )}
                </Card>
            )}

            {/* Hospital camera feed */}
            {streamClient && streamCall && (
                <div className="mt-6">
                    <Card className="p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                            Live Stream
                        </h4>
                        <StreamVideo client={streamClient}>
                            <StreamCall call={streamCall}>
                                <LivestreamLayout />
                            </StreamCall>
                        </StreamVideo>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HospitalMonitoringRequests;