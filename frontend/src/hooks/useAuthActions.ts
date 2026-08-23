import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import * as authService from "@/services/authService";
import { useFirebaseMessaging } from "./useFirebaseMessaging";

export function useAuthActions() {
    const { setUser, setProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

        const { requestPermission, registerTokenWithBackend } =
            useFirebaseMessaging();


    // Patient Signup
    const handlePatientSignup = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.patientSignup(data);
            if (response.success) {
                // Fetch user data after signup
                const userResponse = await authService.me();
                setUser(userResponse.data.user);
                setProfile(userResponse.data.profile);

                navigate("/patient-profile");
                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.message || "Patient signup failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Doctor Signup
    const handleDoctorSignup = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.doctorSignup(data);
            if (response.success) {
                navigate("/upload-documents", {
                    state: {
                        userId: response.data.userId,
                        doctorId: response.data.doctorId
                    }
                });
            }
        } catch (err) {
            const errorMessage = err.message || "Doctor signup failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Hospital Signup
    const handleHospitalSignup = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.hospitalSignup(data);
            if (response.success) {
                navigate("/upload-documents", {
                    state: {
                        userId: response.data.userId,
                        hospitalId: response.data.hospitalId
                    }
                });
            }
        } catch (err) {
            const errorMessage = err.message || "Hospital signup failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Login
    const handleLogin = async (phone, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login({ phone, password });
            if (response.success) {
                const userResponse = await authService.me();
                setUser(userResponse.data.user);
                setProfile(userResponse.data.profile);

                // Navigate based on role
                const role = userResponse.data.user.role;
                if (role === "patient") {
                    navigate("/");
                } else if (role === "doctor") {
                    navigate("/");
                } else if (role === "hospital") {
                    navigate("/hospitalDashboard");
                } else {
                    navigate("/");
                }

                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.message || "Login failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const handleLogout = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.logout();
            setUser(null);
            setProfile(null);
            navigate("/login");
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || "Logout failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };
    // Upload Profile Photo (for Doctor/Patient - single image)
    const handleProfilePhotoUpload = async (imageFile) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.postProfilePhoto(imageFile);
            if (response.success) {
                // Refresh user data to get updated profile photo
                const userResponse = await authService.me();
                setUser(userResponse.data.user);
                setProfile(userResponse.data.profile);
                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.message || "Profile photo upload failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Upload Hospital Photos (for Hospital - up to 4 images)
    const handleUploadHospitalPhotos = async (imageFiles) => {
        setLoading(true);
        setError(null);
        try {
            // Validate image count
            const filesArray = Array.isArray(imageFiles)
                ? imageFiles
                : [imageFiles];
            if (filesArray.length > 4) {
                throw { message: "Maximum 4 images allowed" };
            }

            const response = await authService.postPhotos(imageFiles);
            if (response.success) {
                // Refresh user data to get updated hospital photos
                const userResponse = await authService.me();
                setUser(userResponse.data.user);
                setProfile(userResponse.data.profile);
                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.message || "Hospital photos upload failed";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const handleUploadVerificationDocs = async (userId,files) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authService.uploadVerificationDocs(userId,files);
            return { success: true, message: res.message };
        } catch (err) {
            setError(err.message);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };


    // Clear error
    const clearError = () => {
        setError(null);
    };

    return {
        handlePatientSignup,
        handleDoctorSignup,
        handleHospitalSignup,
        handleLogin,
        handleLogout,
        handleProfilePhotoUpload,
        handleUploadHospitalPhotos,
        handleUploadVerificationDocs,
        loading,
        error,
        clearError,
    };
}
