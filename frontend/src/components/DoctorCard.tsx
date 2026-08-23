import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    GraduationCap,
    Award,
    MapPin,
    Star,
    Calendar,
    IndianRupee,
    Verified,
} from "lucide-react";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Check availability status
    const isAvailable = doctor.currentStatus === "available";

    return (
        <Link to={`/doctor/${doctor._id}`}>
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/30 bg-gradient-to-br from-card via-card to-card/95">
                {/* Decorative gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top accent bar */}
                <div
                    className={`h-1.5 w-full ${
                        isAvailable
                            ? "bg-gradient-to-r from-success via-success/80 to-success"
                            : "bg-gradient-to-r from-muted via-muted-foreground/30 to-muted"
                    }`}
                />

                <div className="relative p-6">
                    {/* Header Section */}
                    <div className="flex items-start gap-4 mb-5">
                        {/* Avatar with status indicator */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                            <Avatar className="relative w-20 h-20 border-3 border-background shadow-lg ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                                <AvatarImage
                                    src={doctor.profilePhoto}
                                    alt={doctor.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary/90 to-accent/90 text-white font-bold text-lg">
                                    {getInitials(doctor.name)}
                                </AvatarFallback>
                            </Avatar>
                            {/* Status indicator dot */}
                            <div
                                className={`absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full border-3 border-background shadow-lg flex items-center justify-center ${
                                    isAvailable
                                        ? "bg-gradient-to-br from-success to-success/80"
                                        : "bg-gradient-to-br from-muted to-muted-foreground"
                                }`}>
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        isAvailable ? "bg-white" : "bg-white/50"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                                    {doctor.name}
                                </h3>
                                {doctor.averageRating >= 4.5 && (
                                    <Verified className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                            </div>

                            <p className="text-sm font-semibold text-primary/90 mb-2 line-clamp-1">
                                {doctor.type}
                            </p>

                            {/* Rating with enhanced styling */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 px-2.5 py-1 rounded-full border border-yellow-200/50 dark:border-yellow-800/30">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-bold text-foreground">
                                        {doctor.averageRating.toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {doctor.ratingCount} reviews
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

                    {/* Details Section */}
                    <div className="space-y-3">
                        {/* Experience */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Award className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <span className="font-semibold text-foreground">
                                    {doctor.experience} Years
                                </span>
                                <span className="text-muted-foreground ml-1">
                                    Experience
                                </span>
                            </div>
                        </div>

                        {/* Education */}
                        {doctor.qualifications &&
                            doctor.qualifications.length > 0 && (
                                <div className="flex items-start gap-2.5 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <GraduationCap className="w-4 h-4 text-accent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-foreground line-clamp-1">
                                            {doctor.qualifications
                                                .filter((q) => q.trim())
                                                .slice(0, 2)
                                                .join(", ")}
                                        </div>
                                        {doctor.educationTimeline &&
                                            doctor.educationTimeline.length >
                                                0 && (
                                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {
                                                        doctor
                                                            .educationTimeline[0]
                                                            .institution
                                                    }
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}

                        {/* Location */}
                        {doctor.city && (
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-muted-foreground font-medium line-clamp-1">
                                    {doctor.city}
                                </span>
                            </div>
                        )}

                        {/* Languages */}
                        {doctor.languages && doctor.languages.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {doctor.languages
                                    .slice(0, 3)
                                    .map((lang, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs px-2.5 py-0.5 font-medium bg-secondary/50 hover:bg-secondary/70 transition-colors">
                                            {lang}
                                        </Badge>
                                    ))}
                                {doctor.languages.length > 3 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2.5 py-0.5 font-medium">
                                        +{doctor.languages.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

                    {/* Footer Section */}
                    <div className="flex items-center justify-between">
                        {/* Consultation Fee */}
                        <div className="flex items-baseline gap-1">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            <span className="text-2xl font-bold text-foreground">
                                {doctor.fee}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                                / session
                            </span>
                        </div>

                        {/* Availability Badge */}
                        <Badge
                            className={`px-3 py-1 font-semibold text-xs shadow-sm ${
                                isAvailable
                                    ? "bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white"
                                    : "bg-gradient-to-r from-muted to-muted-foreground/80 text-muted-foreground hover:from-muted-foreground/80 hover:to-muted-foreground text-white"
                            }`}>
                            {isAvailable ? "Available" : "Not Available"}
                        </Badge>
                    </div>

                    {/* Book Now CTA */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                    Book Appointment
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-primary group-hover:gap-2.5 transition-all font-semibold">
                                <span>View Profile</span>
                                <svg
                                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default DoctorCard;
