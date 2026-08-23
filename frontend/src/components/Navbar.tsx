import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useEmergencyActions } from "@/hooks/useEmergencyActions";
import { Button } from "./ui/button";
import {
    User,
    MessageSquare,
    LogOut,
    Building2,
    Stethoscope,
    ChevronDown,
    Bell,
    Menu,
    X,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Logo from "@/assets/Icon.jpeg";

const Navbar = () => {
    const { user, profile, isAuthenticated } = useAuth();
    const { handleLogout, loading } = useAuthActions();
    const { handleGetUnreadNotificationCount, loading: notificationLoading } =
        useEmergencyActions();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get user role
    const userRole = user?.role;

    // Get user initials
    const getInitials = (name) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Role-based dashboard routes
    const getDashboardRoute = () => {
        switch (userRole) {
            case "patient":
                return "/patient-profile";
            case "doctor":
                return "/doctor-dashboard";
            case "hospital":
                return "/hospitalDashboard";
            case "admin":
                return "/admin-dashboard";
            default:
                return "/";
        }
    };

    // Role-based display name
    const getRoleDisplayName = () => {
        switch (userRole) {
            case "patient":
                return profile?.name || "Patient";
            case "doctor":
                return profile?.name || "Doctor";
            case "hospital":
                return profile?.name || "Hospital";
            default:
                return "User";
        }
    };

    const [notificationError, setNotificationError] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (notificationError) return; // stop spamming when backend is down

        try {
            const result = await handleGetUnreadNotificationCount();
            if (result?.success) {
                setUnreadCount(result.data.unreadCount || 0);
                setNotificationError(false); // reset if backend recovered
            }
        } catch (error) {
            console.warn("Notifications offline");
            setNotificationError(true);

            // Retry once after 60s instead of spamming
            setTimeout(() => setNotificationError(false), 60000);
        }
    }, [handleGetUnreadNotificationCount, notificationError]);


    // Poll for new notifications
    // useEffect(() => {
    //     if (isAuthenticated()) {
    //         fetchUnreadCount();
    //         const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
    //         return () => clearInterval(interval);
    //     }
    // }, [isAuthenticated, fetchUnreadCount]);

    useEffect(() => {
        if (!isAuthenticated()) {
            setUnreadCount(0);
            return;
        }

        // Initial load only
        const fetchOnce = async () => {
            try {
                await fetchUnreadCount();
            } catch (error) {
                console.warn("Initial notification fetch failed");
            }
        };

        fetchOnce();

        // SAFE INTERVAL with REF cleanup
        const interval = setInterval(fetchOnce, 5000); // 1 MINUTE instead of 30s

        return () => {
            clearInterval(interval);
            console.log("🛑 Navbar polling stopped");
        };
    }, []);

    const onLogout = async () => {
        await handleLogout();
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-[70px] items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group flex-shrink-0">
                        <img
                            src={Logo}
                            alt="Med4You"
                            className="h-12 w-17 object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link
                            to="/hospitals"
                            className="group flex items-center gap-1 px-1 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                            Hospitals
                            <ChevronDown className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                            to="/doctors"
                            className="group flex items-center gap-1 px-1 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                            Doctors
                            <ChevronDown className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {userRole === "patient" && (
                            <Link
                                to="/patient-monitoring"
                                className="group flex items-center gap-1 px-1 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                                Patient Monitoring
                                <ChevronDown className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        )}
                    </div>

                    {/* Right Actions - Always visible on all screens */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Always visible: AI Assistant
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 hover:bg-gray-100 transition-colors"
                            asChild>
                            <Link to="/ai-assistant">
                                <MessageSquare className="h-5 w-5 text-gray-700" />
                            </Link>
                        </Button> */}

                        {/* Always visible: Notification Bell */}
                        {isAuthenticated() && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 relative hover:bg-red-50 transition-colors"
                                onClick={() => navigate("/notifications")}
                                title="Notifications">
                                <Bell className="h-5 w-5 text-gray-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg font-medium">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </Button>
                        )}

                        {/* Always visible: Profile Avatar */}
                        {isAuthenticated() ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 hover:bg-gray-100 transition-colors -mr-1 sm:-mr-2"
                                    asChild>
                                    <Link to={getDashboardRoute()}>
                                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-gray-200 shadow-md">
                                            <AvatarImage
                                                src={profile?.profilePhoto}
                                                alt={getRoleDisplayName()}
                                            />
                                            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {getInitials(
                                                    getRoleDisplayName()
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </Button>

                                {/* Logout Button - Desktop only */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onLogout}
                                    disabled={loading}
                                    className="h-10 w-10 hover:bg-red-50 hover:text-red-600 transition-colors hidden sm:flex"
                                    title="Logout">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            // Guest actions - minimized on mobile
                            <div className="hidden sm:flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/login")}
                                    className="font-medium text-gray-700 hover:bg-gray-100 transition-colors h-10">
                                    <User className="h-4 w-4 mr-2" />
                                    Login
                                </Button>
                            </div>
                        )}

                        {/* Hamburger Menu - Mobile only, rightmost */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 lg:hidden ml-1 hover:bg-gray-100 transition-colors"
                            onClick={toggleMobileMenu}
                            title="Menu">
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                        <div className="container mx-auto px-4 py-4">
                            {/* Mobile Navigation Links */}
                            <div className="flex flex-col gap-3 mb-4">
                                <Link
                                    to="/hospitals"
                                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    Hospitals
                                </Link>
                                <Link
                                    to="/doctors"
                                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    Doctors
                                </Link>
                                {userRole === "patient" && (
                                    <Link
                                        to="/patient-monitoring"
                                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }>
                                        Patient Monitoring
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Auth Actions */}
                            {!isAuthenticated() ? (
                                <div className="flex flex-col gap-2 pt-2 border-t">
                                    <Button
                                        size="lg"
                                        className="font-medium h-12 bg-[#003D82] hover:bg-[#002D62] text-white"
                                        onClick={() => {
                                            navigate("/login");
                                            setMobileMenuOpen(false);
                                        }}>
                                        <User className="h-5 w-5 mr-2" />
                                        Login
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="font-medium h-12"
                                        onClick={() => {
                                            navigate("/signup");
                                            setMobileMenuOpen(false);
                                        }}>
                                        Sign Up
                                    </Button>
                                    {/* <Button
                                        variant="default"
                                        size="lg"
                                        className="font-medium h-12 mt-2"
                                        asChild>
                                        <Link
                                            to="/hospitals"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }>
                                            Find Care
                                        </Link>
                                    </Button> */}
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="flex items-center gap-3 text-left text-base font-medium text-red-600 hover:bg-red-50 h-12 px-4"
                                    onClick={onLogout}
                                    disabled={loading}>
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;