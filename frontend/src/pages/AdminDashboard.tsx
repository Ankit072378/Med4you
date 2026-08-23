import { useEffect, useState } from "react";
import { useAdminActions } from "@/hooks/useAdminActions";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ShieldCheck,
    FileText,
    Stethoscope,
    Building2,
    Phone,
    Loader2,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
    const { fetchPending, approveUser } = useAdminActions();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await fetchPending();
        if (res.success) setList(res.data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const verify = async (id) => {
        await approveUser(id);
        toast.success("User verified");
        load();
    };

    const getInitials = (name = "U") =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <ShieldCheck className="text-primary" />
                        Verification Control Center
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Review and approve doctors and hospitals before they can
                        operate on the platform.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <Card className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Pending Requests
                        </p>
                        <p className="text-3xl font-bold">{list.length}</p>
                    </Card>

                    <Card className="p-6">
                        <p className="text-sm text-muted-foreground">Doctors</p>
                        <p className="text-3xl font-bold">
                            {
                                list.filter((x) => x.user.role === "doctor")
                                    .length
                            }
                        </p>
                    </Card>

                    <Card className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Hospitals
                        </p>
                        <p className="text-3xl font-bold">
                            {
                                list.filter((x) => x.user.role === "hospital")
                                    .length
                            }
                        </p>
                    </Card>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}

                {/* Empty */}
                {!loading && list.length === 0 && (
                    <Card className="p-12 text-center">
                        <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">All Clear</h3>
                        <p className="text-muted-foreground">
                            No pending verification requests
                        </p>
                    </Card>
                )}

                {/* Requests */}
                <div className="grid md:grid-cols-2 gap-8">
                    {list.map(({ user, profile }) => (
                        <Card key={user._id} className="p-6 space-y-6">
                            {/* Top */}
                            <div className="flex justify-between">
                                <div className="flex gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={profile?.photo} />
                                        <AvatarFallback className="bg-primary text-white text-xl">
                                            {getInitials(profile?.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {profile?.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {user.phone}
                                        </p>

                                        <Badge className="mt-2 capitalize">
                                            {user.role === "doctor" ? (
                                                <Stethoscope size={14} />
                                            ) : (
                                                <Building2 size={14} />
                                            )}
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>

                                <Button onClick={() => verify(user._id)}>
                                    Approve
                                </Button>
                            </div>

                            {/* Documents */}
                            <div>
                                <p className="text-sm font-medium mb-3">
                                    Verification Documents
                                </p>

                                {user.verificationDocs?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {user.verificationDocs.map((doc, i) => (
                                            <a
                                                key={i}
                                                href={doc}
                                                target="_blank"
                                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <span className="text-sm">
                                                    Document {i + 1}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No documents uploaded
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
