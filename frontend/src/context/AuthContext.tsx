import { createContext, useContext, useEffect, useState } from "react";
import { me } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // basic user
    const [profile, setProfile] = useState(null); // patient/doctor/hospital data
    const [loading, setLoading] = useState(true);

    // Auto-load user on mount/refresh
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await me();
                setUser(res.data.user);
                setProfile(res.data.profile);
            } catch (err) {
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    // Check if user is authenticated
    const isAuthenticated = () => {
        return user !== null;
    };

    // Check user role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Check multiple roles
    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    const value = {
        user,
        profile,
        setUser,
        setProfile,
        loading,
        isAuthenticated,
        hasRole,
        hasAnyRole,
    };
    console.log(value);

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
