import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import roboticAI from "@/assets/roboticAI.png";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import Doctors from "./pages/Doctors";
import HospitalDetail from "./pages/HospitalDetail";
import DoctorDetail from "./pages/DoctorDetail";
import PatientMonitoring from "./pages/PatientMonitoring";
import QueueTracking from "./pages/QueueTracking";
import PatientProfile from "./pages/PatientProfile";
import MedicalHistoryEdit from "@/pages/MedicalHistoryEdit";
import AIAssistant from "./pages/AIAssistant";
import BedBooking from "./pages/BedBooking";
import DoctorDashboard from "./pages/DoctorDashboard";
import NotFound from "./pages/NotFound";
import HospitalDashboard from "./pages/HospitalDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DoctorProfile from "./pages/DoctorProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotificationsPage from "./pages/NotificationsPage";
import UploadVerificationDocs from "./pages/UploadVerificationDocs";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient()

const App = () => {
     useEffect(() => {
         if ("serviceWorker" in navigator) {
             navigator.serviceWorker
                 .register("/firebase-messaging-sw.js")
                 .then(() => console.log("🔥 Firebase Messaging SW registered"))
                 .catch((err) =>
                     console.error("❌ Firebase SW registration failed", err)
                 );
         }
     }, []);
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/hospitalDashboard"
                            element={
                                <ProtectedRoute allowedRoles={["hospital"]}>
                                    <HospitalDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/doctor-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["doctor"]}>
                                    <DoctorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient-profile"
                            element={
                                <ProtectedRoute allowedRoles={["patient"]}>
                                    <PatientProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/medical-history/edit"
                            element={
                                <ProtectedRoute allowedRoles={["patient"]}>
                                    <MedicalHistoryEdit />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/hospitals" element={<Hospitals />} />
                        <Route path="/doctors" element={<Doctors />} />
                        <Route path="/hospital/:id" element={<HospitalDetail />} />
                        <Route path="/doctor/:id" element={<DoctorDetail />} />

                        <Route
                            path="/patient-monitoring"
                            element={<PatientMonitoring />}
                        />
                        <Route path="/queue-tracking" element={<QueueTracking />} />
                        <Route
                            path="/ai-assistant"
                            element={
                                <ProtectedRoute allowedRoles={["patient"]}>
                                    <AIAssistant />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={<NotificationsPage />}
                        />
                        <Route
                            path="/upload-documents"
                            element={<UploadVerificationDocs />}
                        />
                        <Route
                            path="/bed-booking/:id"
                            element={
                                <ProtectedRoute allowedRoles={["patient"]}>
                                    <BedBooking />
                                </ProtectedRoute>
                            }
                        />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <FloatingAIButton />
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    )
};

export default App;

function FloatingAIButton() {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-6 left-6 z-50 group">
            {/* Tooltip */}
            <div
                className="
                    absolute -top-10 left-1/2 -translate-x-1/2
                    px-3 py-1 text-sm font-medium
                    bg-blue-600 text-white rounded-md
                    opacity-0 group-hover:opacity-100
                    transition-opacity
                    whitespace-nowrap
                    shadow-lg
                ">
                Talk to AI
            </div>

            {/* Robot */}
            <img
                src={roboticAI}
                alt="Med4U AI Assistant"
                onClick={() => navigate("/ai-assistant")}
                className="
                    h-20 w-20 cursor-pointer
                    animate-float
                    hover:scale-110 active:scale-95
                    transition-transform

                    drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]
                    group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.9)]
                "
            />
        </div>
    );
}
