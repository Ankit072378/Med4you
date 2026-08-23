import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    Building2,
    User,
} from "lucide-react";
import { useMedicalRecordActions } from "@/hooks/useMedicalRecordActions";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import { toast } from "sonner";

const AccessRequestManager = ({ patientId }) => {
    const {
        handleGetPatientAccessRequests,
        handleRespondToAccessRequest,
        handleRevokeAccess,
        loading,
    } = useMedicalRecordActions();

    const { handleGetDoctorByUserId } = useDoctorActions();

    const [requests, setRequests] = useState([]);
    const [responding, setResponding] = useState(null);
    const [doctorDetails, setDoctorDetails] = useState({});

    useEffect(() => {
        fetchRequests();
    }, [patientId]);

    const fetchRequests = async () => {
        const result = await handleGetPatientAccessRequests(patientId);
        if (result.success) {
            setRequests(result.data);
            fetchDoctorDetailsForRequests(result.data);
        }
    };

    const extractDoctorId = (request) => {
        if (request.requesterType !== "doctor") return null;

        if (typeof request.requesterId === "string") {
            return request.requesterId;
        }

        if (typeof request.requesterId === "object" && request.requesterId) {
            const doctorId = request.requesterId._id;
            return doctorId;
        }

        return null;
    };

    const fetchDoctorDetailsForRequests = async (requestsList) => {
        const doctorRequests = requestsList.filter(
            (req) => req.requesterType === "doctor" && req.requesterId
        );

        const doctorDetailsMap = { ...doctorDetails };

        for (const request of doctorRequests) {
            const doctorId = extractDoctorId(request);

            if (doctorId && !doctorDetailsMap[doctorId]) {
                const result = await handleGetDoctorByUserId(doctorId);
                if (result.success) {
                    doctorDetailsMap[doctorId] = result.data;
                }
            }
        }

        setDoctorDetails(doctorDetailsMap);
    };

    const handleApprove = async (requestId) => {
        setResponding(requestId);
        const result = await handleRespondToAccessRequest(requestId, {
            status: "approved",
            accessDuration: 90,
        });

        if (result.success) {
            toast.success("Access granted successfully");
            fetchRequests();
        } else {
            toast.error("Failed to approve access");
        }
        setResponding(null);
    };

    const handleReject = async (requestId) => {
        setResponding(requestId);
        const result = await handleRespondToAccessRequest(requestId, {
            status: "rejected",
            rejectionReason: "Access denied by patient",
        });

        if (result.success) {
            toast.success("Access denied");
            fetchRequests();
        } else {
            toast.error("Failed to reject access");
        }
        setResponding(null);
    };

    const handleRevoke = async (requestId) => {
        setResponding(requestId);
        const result = await handleRevokeAccess(requestId);

        if (result.success) {
            toast.success("Access revoked successfully");
            fetchRequests();
        } else {
            toast.error("Failed to revoke access");
        }
        setResponding(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getRequesterIcon = (type) => {
        return type === "hospital" ? (
            <Building2 className="h-4 w-4" />
        ) : (
            <User className="h-4 w-4" />
        );
    };

    const getRequesterInfo = (request) => {
        if (request.requesterType === "hospital") {
            return {
                name: request.requesterId?.name || "Hospital",
                photo:
                    request.requesterId?.photo?.[0] ||
                    request.requesterId?.profilePhoto,
                isDoctor: false,
            };
        }

        const doctorId = extractDoctorId(request);
        const doctorData = doctorDetails[doctorId];

        if (doctorData) {
            return {
                name: doctorData.name,
                type: doctorData.type,
                experience: doctorData.experience,
                city: doctorData.city,
                photo: doctorData.profilePhoto,
                isDoctor: true,
                id: doctorId,
            };
        }

        if (typeof request.requesterId === "object" && request.requesterId) {
            return {
                name: request.requesterId.name || "Doctor",
                type: request.requesterId.type,
                photo: request.requesterId.profilePhoto,
                isDoctor: true,
                id: doctorId,
            };
        }

        return {
            name: "Doctor",
            isDoctor: true,
            id: doctorId,
        };
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                    Loading access requests...
                </p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                    No access requests at the moment
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => {
                const requesterInfo = getRequesterInfo(request);

                return (
                    <Card key={request._id} className="p-5">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={requesterInfo.photo} />
                                    <AvatarFallback>
                                        {getRequesterIcon(
                                            request.requesterType
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h4 className="font-semibold text-foreground">
                                            {requesterInfo.name}
                                        </h4>

                                        <Badge
                                            variant={
                                                request.status === "approved"
                                                    ? "default"
                                                    : request.status ===
                                                      "pending"
                                                    ? "secondary"
                                                    : "destructive"
                                            }>
                                            {request.status}
                                        </Badge>
                                    </div>

                                    {requesterInfo.isDoctor &&
                                        requesterInfo.type && (
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <span className="font-medium">
                                                    {requesterInfo.type}
                                                </span>
                                                {requesterInfo.experience && (
                                                    <span>
                                                        {" "}
                                                        •{" "}
                                                        {
                                                            requesterInfo.experience
                                                        }{" "}
                                                        years exp.
                                                    </span>
                                                )}
                                                {requesterInfo.city && (
                                                    <span>
                                                        {" "}
                                                        • {requesterInfo.city}
                                                    </span>
                                                )}
                                            </p>
                                        )}

                                    <p className="text-sm text-muted-foreground mb-2">
                                        <span className="font-medium">
                                            Purpose:
                                        </span>{" "}
                                        {request.purpose}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Requested:{" "}
                                            {formatDate(request.createdAt)}
                                        </span>

                                        {request.status === "approved" &&
                                            request.accessExpiresAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Expires:{" "}
                                                    {formatDate(
                                                        request.accessExpiresAt
                                                    )}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {request.status === "pending" && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-success border-success hover:bg-success hover:text-white"
                                            onClick={() =>
                                                handleApprove(request._id)
                                            }
                                            disabled={
                                                responding === request._id
                                            }>
                                            {responding === request._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                                            onClick={() =>
                                                handleReject(request._id)
                                            }
                                            disabled={
                                                responding === request._id
                                            }>
                                            {responding === request._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Deny
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}

                                {request.status === "approved" && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            handleRevoke(request._id)
                                        }
                                        disabled={responding === request._id}>
                                        {responding === request._id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Revoke Access"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default AccessRequestManager;
