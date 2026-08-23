import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDoctorActions } from "@/hooks/useDoctorActions";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    MapPin,
    Star,
    Clock,
    Award,
    Phone,
    Mail,
    Loader2,
    Filter,
    IndianRupee,
    Stethoscope,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Doctors = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleGetDoctors, loading, error } = useDoctorActions();

    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );
    const [selectedSpecialization, setSelectedSpecialization] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("rating");

    // Fetch doctors on component mount
    useEffect(() => {
        const fetchDoctors = async () => {
            const result = await handleGetDoctors();
            if (result.success) {
                setDoctors(result.data);
                setFilteredDoctors(result.data);
            }
        };

        fetchDoctors();
    }, []);

    // Filter and search doctors
    useEffect(() => {
        let filtered = [...doctors];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (doctor) =>
                    doctor.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    doctor.type
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    doctor.city
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        // Specialization filter
        if (selectedSpecialization !== "all") {
            filtered = filtered.filter(
                (doctor) => doctor.type === selectedSpecialization
            );
        }

        // City filter
        if (selectedCity !== "all") {
            filtered = filtered.filter(
                (doctor) => doctor.city === selectedCity
            );
        }

        // Sort doctors
        filtered.sort((a, b) => {
            if (sortBy === "rating") {
                return b.averageRating - a.averageRating;
            } else if (sortBy === "experience") {
                return b.experience - a.experience;
            } else if (sortBy === "fee-low") {
                return a.fee - b.fee;
            } else if (sortBy === "fee-high") {
                return b.fee - a.fee;
            }
            return 0;
        });

        setFilteredDoctors(filtered);
    }, [searchQuery, selectedSpecialization, selectedCity, sortBy, doctors]);

    // Get unique specializations
    const specializations = [
        "all",
        ...new Set(doctors.map((d) => d.type).filter(Boolean)),
    ];

    // Get unique cities
    const cities = [
        "all",
        ...new Set(doctors.map((d) => d.city).filter(Boolean)),
    ];

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 md:py-16">
                <div className="container">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Find Your{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Doctor
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-6">
                            Search from thousands of qualified doctors across
                            India
                        </p>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by doctor name, specialization, or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-base"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="border-b bg-card sticky top-[70px] z-40">
                <div className="container py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span className="font-medium">
                                {filteredDoctors.length} doctors found
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <Select
                                value={selectedSpecialization}
                                onValueChange={setSelectedSpecialization}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Specialization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specializations.map((spec) => (
                                        <SelectItem key={spec} value={spec}>
                                            {spec === "all"
                                                ? "All Specializations"
                                                : spec}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedCity}
                                onValueChange={setSelectedCity}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city === "all"
                                                ? "All Cities"
                                                : city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rating">
                                        Highest Rated
                                    </SelectItem>
                                    <SelectItem value="experience">
                                        Most Experienced
                                    </SelectItem>
                                    <SelectItem value="fee-low">
                                        Fee: Low to High
                                    </SelectItem>
                                    <SelectItem value="fee-high">
                                        Fee: High to Low
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors List */}
            <section className="py-12">
                <div className="container">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Loading doctors...
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <Card className="p-8 text-center">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </Card>
                    ) : filteredDoctors.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No doctors found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search or filters
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedSpecialization("all");
                                    setSelectedCity("all");
                                }}>
                                Clear Filters
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
                                <Card
                                    key={doctor._id}
                                    className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                    onClick={() =>
                                        navigate(`/doctor/${doctor._id}`)
                                    }>
                                    <div className="flex items-start gap-4 mb-4">
                                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                                            <AvatarImage
                                                src={doctor.profilePhoto}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {getInitials(doctor.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                {doctor.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {doctor.type}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium ml-1">
                                                        {doctor.averageRating.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    ({doctor.ratingCount}{" "}
                                                    reviews)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Award className="h-4 w-4 mr-2 text-primary" />
                                            <span>
                                                {doctor.experience} years
                                                experience
                                            </span>
                                        </div>

                                        {doctor.city && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                <span>{doctor.city}</span>
                                            </div>
                                        )}

                                        {doctor.languages &&
                                            doctor.languages.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {doctor.languages.map(
                                                        (lang, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="text-xs">
                                                                {lang}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    {doctor.about && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {doctor.about}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center">
                                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-lg font-bold text-foreground">
                                                {doctor.fee}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-1">
                                                / consultation
                                            </span>
                                        </div>

                                        <Badge
                                            variant={
                                                doctor.currentStatus ===
                                                "available"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="text-xs">
                                            {doctor.currentStatus ===
                                            "available"
                                                ? "Available"
                                                : doctor.currentStatus ===
                                                  "busy"
                                                ? "Busy"
                                                : "Not Available"}
                                        </Badge>
                                    </div>

                                    <Button
                                        className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/doctor/${doctor._id}`);
                                        }}>
                                        View Profile
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Doctors;
