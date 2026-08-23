import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Bed,
    Building2,
    IndianRupee,
    Loader2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Clock,
    User,
    Phone,
    CreditCard,
} from "lucide-react";
import { toast } from "sonner";

const BedBooking = () => {
    const { id } = useParams(); // hospital ID
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const {
        handleGetHospitalById,
        handleUpdateBed,
        loading: hospitalLoading,
    } = useHospitalActions();

    const [hospital, setHospital] = useState(null);
    const [selectedBedType, setSelectedBedType] = useState("all");
    const [selectedBed, setSelectedBed] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Booking form data
    const [formData, setFormData] = useState({
        patientName: profile?.name || "",
        patientPhone: user?.phone || "",
        expectedDuration: "",
        notes: "",
        paymentMethod: "",
    });

    // Fetch hospital data
    useEffect(() => {
        const fetchHospital = async () => {
            const result = await handleGetHospitalById(id);
            if (result.success) {
                setHospital(result.data);
            } else {
                toast.error("Failed to load hospital details");
            }
        };

        if (id) {
            fetchHospital();
        }
    }, [id]);

    // Get available beds by type
    const getAvailableBeds = () => {
        if (!hospital?.beds) return [];

        let beds = hospital.beds.filter((bed) => bed.status === "available");

        if (selectedBedType !== "all") {
            beds = beds.filter((bed) => bed.type === selectedBedType);
        }

        return beds.sort((a, b) => a.bedNumber - b.bedNumber);
    };

    // Get bed type statistics
    const getBedTypeStats = () => {
        if (!hospital?.beds) return {};

        const stats = {
            all: 0,
            general: 0,
            icu: 0,
            emergency: 0,
            vip: 0,
        };

        hospital.beds.forEach((bed) => {
            if (bed.status === "available") {
                stats.all++;
                stats[bed.type]++;
            }
        });

        return stats;
    };

    const bedTypeStats = hospital ? getBedTypeStats() : {};
    const availableBeds = hospital ? getAvailableBeds() : [];

    // Handle bed selection
    const handleBedSelect = (bed) => {
        setSelectedBed(bed);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle booking submission
    const handleBookBed = async (e) => {
        e.preventDefault();

        if (!selectedBed) {
            toast.error("Please select a bed");
            return;
        }

        if (!formData.patientName || !formData.patientPhone) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setBookingLoading(true);

        try {
            const result = await handleUpdateBed({
                hospitalId: id,
                bedId: selectedBed._id,
                status: "reserved",
                patientId: profile?._id,
                notes: formData.notes,
                reservationTime: new Date().toISOString(),
                expectedReleaseTime: formData.expectedDuration
                    ? new Date(
                          Date.now() +
                              parseInt(formData.expectedDuration) *
                                  24 *
                                  60 *
                                  60 *
                                  1000
                      ).toISOString()
                    : null,
            });

            if (result.success) {
                toast.success("Bed booked successfully!");
                navigate(`/hospital/${id}`);
            } else {
                toast.error("Failed to book bed");
            }
        } catch (error) {
            toast.error("An error occurred while booking");
        } finally {
            setBookingLoading(false);
        }
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
                            Loading hospital information...
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
                        Unable to load hospital information
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

            {/* Header */}
            <div className="bg-gradient-to-b from-muted/30 to-background border-b">
                <div className="container py-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/hospital/${id}`)}
                        className="mb-4 -ml-3">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Hospital
                    </Button>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Book a Bed
                            </h1>
                            <p className="text-muted-foreground">
                                {hospital.name} • {hospital.city}
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {bedTypeStats.all} beds available
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-10">
                <div className="max-w-6xl mx-auto">
                    {availableBeds.length === 0 ? (
                        <Card className="p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Beds Available
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                All beds are currently occupied or reserved.
                                Please check back later.
                            </p>
                            <Button onClick={() => navigate(`/hospital/${id}`)}>
                                Back to Hospital
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Bed Selection */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Filter */}
                                <Card className="p-5">
                                    <Label className="text-sm font-medium mb-2 block">
                                        Filter by Bed Type
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {[
                                            { value: "all", label: "All" },
                                            {
                                                value: "general",
                                                label: "General",
                                            },
                                            { value: "icu", label: "ICU" },
                                            {
                                                value: "emergency",
                                                label: "Emergency",
                                            },
                                            { value: "vip", label: "VIP" },
                                        ].map((type) => (
                                            <Button
                                                key={type.value}
                                                variant={
                                                    selectedBedType ===
                                                    type.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedBedType(
                                                        type.value
                                                    )
                                                }
                                                className="justify-between">
                                                {type.label}
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2 text-xs">
                                                    {bedTypeStats[type.value] ||
                                                        0}
                                                </Badge>
                                            </Button>
                                        ))}
                                    </div>
                                </Card>

                                {/* Bed Grid */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">
                                        Select a Bed
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {availableBeds.map((bed) => (
                                            <Card
                                                key={bed._id}
                                                className={`p-5 cursor-pointer transition-all ${
                                                    selectedBed?._id === bed._id
                                                        ? "border-primary border-2 bg-primary/5"
                                                        : "hover:border-primary/50"
                                                }`}
                                                onClick={() =>
                                                    handleBedSelect(bed)
                                                }>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                                            <Bed className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">
                                                                Bed #
                                                                {bed.bedNumber}
                                                            </p>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs mt-1">
                                                                {bed.type.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {selectedBed?._id ===
                                                        bed._id && (
                                                        <CheckCircle className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>

                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-2xl font-bold">
                                                        {bed.price}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        / day
                                                    </span>
                                                </div>

                                                {bed.notes && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {bed.notes}
                                                    </p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="lg:col-span-1">
                                <Card className="p-5 sticky top-24">
                                    <h3 className="text-lg font-semibold mb-4">
                                        Booking Details
                                    </h3>

                                    {selectedBed ? (
                                        <form
                                            onSubmit={handleBookBed}
                                            className="space-y-4">
                                            {/* Selected Bed Info */}
                                            <div className="p-4 bg-muted/50 rounded-lg mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">
                                                        Bed #
                                                        {selectedBed.bedNumber}
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {selectedBed.type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <IndianRupee className="h-4 w-4" />
                                                    <span className="text-xl font-bold">
                                                        {selectedBed.price}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        / day
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Patient Name */}
                                            <div>
                                                <Label
                                                    htmlFor="patientName"
                                                    className="text-sm">
                                                    Patient Name *
                                                </Label>
                                                <Input
                                                    id="patientName"
                                                    name="patientName"
                                                    value={formData.patientName}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1"
                                                />
                                            </div>

                                            {/* Patient Phone */}
                                            <div>
                                                <Label
                                                    htmlFor="patientPhone"
                                                    className="text-sm">
                                                    Phone Number *
                                                </Label>
                                                <Input
                                                    id="patientPhone"
                                                    name="patientPhone"
                                                    value={
                                                        formData.patientPhone
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1"
                                                />
                                            </div>

                                            {/* Expected Duration */}
                                            <div>
                                                <Label
                                                    htmlFor="expectedDuration"
                                                    className="text-sm">
                                                    Expected Duration (days)
                                                </Label>
                                                <Input
                                                    id="expectedDuration"
                                                    name="expectedDuration"
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        formData.expectedDuration
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 3"
                                                    className="mt-1"
                                                />
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <Label
                                                    htmlFor="notes"
                                                    className="text-sm">
                                                    Additional Notes
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    placeholder="Any special requirements..."
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <Label className="text-sm mb-2 block">
                                                    Payment Method *
                                                </Label>
                                                <Select
                                                    value={
                                                        formData.paymentMethod
                                                    }
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            paymentMethod:
                                                                value,
                                                        }))
                                                    }>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="card">
                                                            Credit/Debit Card
                                                        </SelectItem>
                                                        <SelectItem value="upi">
                                                            UPI
                                                        </SelectItem>
                                                        <SelectItem value="cash">
                                                            Cash (Pay at
                                                            Hospital)
                                                        </SelectItem>
                                                        <SelectItem value="insurance">
                                                            Insurance
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Total Estimate */}
                                            {formData.expectedDuration && (
                                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">
                                                            Estimated Total
                                                        </span>
                                                        <div className="flex items-baseline gap-1">
                                                            <IndianRupee className="h-4 w-4" />
                                                            <span className="text-xl font-bold text-primary">
                                                                {parseInt(
                                                                    selectedBed.price
                                                                ) *
                                                                    parseInt(
                                                                        formData.expectedDuration
                                                                    )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        For{" "}
                                                        {
                                                            formData.expectedDuration
                                                        }{" "}
                                                        day(s)
                                                    </p>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                size="lg"
                                                disabled={bookingLoading}>
                                                {bookingLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Booking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Confirm Booking
                                                    </>
                                                )}
                                            </Button>

                                            <p className="text-xs text-muted-foreground text-center">
                                                By booking, you agree to the
                                                hospital's terms and conditions
                                            </p>
                                        </form>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-muted-foreground">
                                                Select a bed to continue
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BedBooking;