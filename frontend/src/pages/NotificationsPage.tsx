import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useEmergencyActions } from "@/hooks/useEmergencyActions";
import {
    MapPin,
    Phone,
    User,
    Clock,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { handleGetUserNotifications, handleMarkNotificationResolved } =
        useEmergencyActions();

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await handleGetUserNotifications();
            if (res.success) {
                setNotifications(res.data.notifications || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const formatTime = (date: string) =>
        new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <div className="animate-spin h-10 w-10 border-b-2 border-red-500 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />

            <div className="container max-w-5xl py-10">
                {/* Page Header */}
                <div className="mb-10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Emergency Alerts
                        </h1>
                        <p className="text-muted-foreground">
                            Immediate help requests from patients
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                {notifications.length === 0 ? (
                    <div className="bg-background rounded-xl border p-16 text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                            No active emergencies
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            You will see alerts here when someone needs help.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                className="bg-background border rounded-xl p-6 shadow-sm">
                                {/* Top Row */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {n.patientName} needs urgent
                                                help
                                            </h2>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Clock className="h-4 w-4" />
                                                {formatTime(n.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            handleMarkNotificationResolved(
                                                n._id
                                            ).then(loadNotifications)
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Mark Resolved
                                    </Button>
                                </div>

                                {/* Divider */}
                                <div className="my-6 border-t" />

                                {/* Patient Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Age
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            {n.age}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Blood Group
                                        </p>
                                        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-red-50 text-red-700 font-medium">
                                            {n.bloodGroup}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Contact
                                        </p>
                                        <p className="font-medium">
                                            {n.patientPhone || "Not available"}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="justify-start">
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(
                                                n.location
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            View Location on Map
                                        </a>
                                    </Button>

                                    {n.patientPhone && (
                                        <Button
                                            asChild
                                            className="bg-blue-600 hover:bg-blue-700 justify-start">
                                            <a href={`tel:${n.patientPhone}`}>
                                                <Phone className="h-5 w-5 mr-2" />
                                                Call Patient
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
