import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useHospitalActions } from "@/hooks/useHospitalActions";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Star,
    Bed,
    Phone,
    Loader2,
    Building2,
} from "lucide-react";
import { toast } from "sonner";

const Hospitals = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialSearch = searchParams.get("search") || "";
    const { handleGetHospitals, loading, error } = useHospitalActions();
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);


    const [hospitals, setHospitals] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sortBy, setSortBy] = useState("rating");
    const [filterCity, setFilterCity] = useState("all");

    // Fetch hospitals on mount
    useEffect(() => {
        const fetchHospitals = async () => {
            const result = await handleGetHospitals();
            if (result.success) {
                setHospitals(result.data);
            } else {
                toast.error("Failed to load hospitals");
            }
        };

        fetchHospitals();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Location not supported by browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                toast.error(
                    "Location permission denied. Showing all hospitals."
                );
            },
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        if (userLocation) {
            setSortBy("distance");
        }
    }, [userLocation]);


    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth radius
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };


    // Get unique cities from hospitals data
    const cities = useMemo(() => {
        const uniqueCities = [...new Set(hospitals.map((h) => h.city))].filter(
            Boolean
        );
        return uniqueCities.sort();
    }, [hospitals]);

    // Calculate available beds for a hospital
    const getAvailableBeds = (beds) => {
        if (!beds || beds.length === 0) return 0;
        return beds.filter((bed) => bed.status === "available").length;
    };

    // Filter and sort hospitals
    const filteredAndSortedHospitals = useMemo(() => {
        let filtered = hospitals.map((h) => {
            const beds = Array.isArray(h.beds) ? h.beds : [];

            if (!userLocation || !h.location?.lat) {
                return { ...h, beds };
            }

            const distance = getDistanceKm(
                userLocation.lat,
                userLocation.lng,
                h.location.lat,
                h.location.lng
            );

            return { ...h, beds, distance };
        });

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (h) =>
                    h.name.toLowerCase().includes(query) ||
                    h.city?.toLowerCase().includes(query) ||
                    h.address?.toLowerCase().includes(query) ||
                    h.specialities?.some((s) => s.toLowerCase().includes(query))
            );
        }

        // Filter by city
        if (filterCity !== "all") {
            filtered = filtered.filter((h) => h.city === filterCity);
        }

        // Sort hospitals
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "distance":
                    return (a.distance ?? 9999) - (b.distance ?? 9999);
                case "rating":
                    return b.averageRating - a.averageRating;
                case "beds":
                    return getAvailableBeds(b.beds) - getAvailableBeds(a.beds);
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [searchQuery, sortBy, filterCity, hospitals, userLocation]);

    // Navigate to hospital detail page
    const handleHospitalClick = (hospitalId) => {
        navigate(`/hospital/${hospitalId}`);
    };

    // Loading state
    if (loading && hospitals.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container py-20 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Loading hospitals...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Find Hospitals
                    </h1>
                    <p className="text-muted-foreground">
                        Search and compare hospitals across India
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-card rounded-xl p-6 shadow-lg border border-border mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by hospital name, city, or specialty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={filterCity}
                            onValueChange={setFilterCity}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-48">
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="distance">
                                    Nearest First
                                </SelectItem>
                                <SelectItem value="rating">
                                    Highest Rating
                                </SelectItem>
                                <SelectItem value="beds">
                                    Most Beds Available
                                </SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-muted-foreground">
                        Found{" "}
                        <span className="font-semibold text-foreground">
                            {filteredAndSortedHospitals.length}
                        </span>{" "}
                        hospitals
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="p-8 text-center mb-6">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </Card>
                )}

                {/* Hospital Cards */}
                {filteredAndSortedHospitals.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedHospitals.map((hospital) => (
                            <Card
                                key={hospital._id}
                                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-border"
                                onClick={() =>
                                    handleHospitalClick(hospital._id)
                                }>
                                {/* Hospital Image */}
                                {hospital.photo && hospital.photo.length > 0 ? (
                                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                                        <img
                                            src={hospital.photo[0]}
                                            alt={hospital.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                        <Building2 className="h-16 w-16 text-primary/40" />
                                    </div>
                                )}

                                {/* Hospital Info */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                            {hospital.name}
                                        </h3>

                                        {/* Location */}
                                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                                            <span className="line-clamp-1">
                                                {hospital.city}
                                                {hospital.address &&
                                                    `, ${hospital.address}`}
                                            </span>
                                        </div>

                                        {hospital.distance !== undefined && (
                                            <div className="flex items-center text-sm text-purple-600 font-semibold">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {hospital.distance.toFixed(1)}{" "}
                                                km away
                                            </div>
                                        )}

                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium ml-1">
                                                    {hospital.averageRating.toFixed(
                                                        1
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                ({hospital.ratingCount} reviews)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Specialities */}
                                    {hospital.specialities &&
                                        hospital.specialities.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {hospital.specialities
                                                    .slice(0, 3)
                                                    .map((spec, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                {hospital.specialities.length >
                                                    3 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs">
                                                        +
                                                        {hospital.specialities
                                                            .length - 3}{" "}
                                                        more
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center text-sm">
                                            <Bed className="h-4 w-4 mr-1 text-primary" />
                                            <span className="font-medium">
                                                {getAvailableBeds(
                                                    hospital.beds
                                                )}
                                            </span>
                                            <span className="text-muted-foreground ml-1">
                                                beds available
                                            </span>
                                        </div>

                                        {hospital.contacts?.phone &&
                                            hospital.contacts.phone.length >
                                                0 && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    <span>
                                                        {
                                                            hospital.contacts
                                                                .phone[0]
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    {/* View Button */}
                                    <Button
                                        className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHospitalClick(hospital._id);
                                        }}>
                                        View Details
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg text-foreground font-semibold mb-2">
                            No hospitals found
                        </p>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search criteria or filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery("");
                                setFilterCity("all");
                            }}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hospitals;
