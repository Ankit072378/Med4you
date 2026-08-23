// src/hooks/useFirebaseMessaging.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyDxY5BgLTFUs5uTwaZ8OFq_RKbF51uh2Ls",
    authDomain: "med4u-c3db7.firebaseapp.com",
    projectId: "med4u-c3db7",
    storageBucket: "med4u-c3db7.firebasestorage.app",
    messagingSenderId: "801202238162",
    appId: "1:801202238162:web:d1ad7672cd44b4dea0f30b",
};

export const useFirebaseMessaging = () => {
    const { user } = useAuth();
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    

    // Request notification permission and get token
    const requestPermission = useCallback(async (): Promise<string | false> => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            const msg = "Push notifications not supported";
            setError(msg);
            return Promise.reject(msg);
        }

        try {
            setLoading(true);

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                const msg = "Notification permission denied";
                setError(msg);
                return Promise.reject(msg);
            }

            // Import firebase messaging (modular v9+)
            const { getMessaging, getToken } = await import(
                "firebase/messaging"
            );
            const { initializeApp } = await import("firebase/app"); // ✅ FIXED: Import properly

            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            // Get FCM token - Replace YOUR_VAPID_KEY with actual key from Firebase Console
            const currentToken = await getToken(messaging, {
                vapidKey:
                    "BPsMt_AjOFz5Tn_c52jva2Sb5QBnvxi8wvlZJVaxciJHNuRJnmJapomnrc-w3KvBdeDeInNwBmHTixJAihyKKNg", // 🔧 Get this from Firebase Console
            });

            if (currentToken) {
                setToken(currentToken);
                setIsSupported(true);
                setError(null);
                return currentToken;
            } else {
                const msg = "No registration token available";
                setError(msg);
                return Promise.reject(msg);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "FCM initialization failed";
            console.error("FCM Error:", err);
            setError(errorMessage);
            return Promise.reject(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Register token with backend
    const registerTokenWithBackend = useCallback(
        async (fcmToken: string): Promise<boolean> => {
            if (!user || !fcmToken) return false;

            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No auth token found");

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/fcm/add-token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // 🔥 send auth cookie
                    body: JSON.stringify({ fcmToken }),
                });

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                const data = await response.json();
                console.log("✅ FCM token registered:", data);
                return data.success === true;
            } catch (err) {
                console.error("❌ Token registration failed:", err);
                return false;
            }
        },
        [user]
    );

    // Auto-register token after login
    useEffect(() => {
        let isMounted = true;

        if (user && isMounted) {
            requestPermission()
                .then((fcmToken) => {
                    if (fcmToken && isMounted) {
                        registerTokenWithBackend(fcmToken);
                    }
                })
                .catch((err) => {
                    console.warn("FCM setup failed:", err);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [user, requestPermission, registerTokenWithBackend]);

    // Foreground message handler
    useEffect(() => {
        if (!isSupported) return;

        let isMounted = true;

        const setupForegroundHandler = async () => {
            try {
                const { onMessage } = await import("firebase/messaging");
                const { getMessaging } = await import("firebase/messaging");
                const { initializeApp } = await import("firebase/app"); // ✅ FIXED: Import properly

                const app = initializeApp(firebaseConfig, "foreground"); // Different app name to avoid conflicts
                const messaging = getMessaging(app);

                onMessage(messaging, (payload) => {
                    console.log("📱 Foreground message:", payload);

                    // Dispatch custom event for other components to listen
                    window.dispatchEvent(
                        new CustomEvent("fcm_message", {
                            detail: payload,
                            bubbles: true,
                        })
                    );
                });
            } catch (err) {
                console.error("Foreground message handler setup failed:", err);
            }
        };

        setupForegroundHandler();

        return () => {
            isMounted = false;
        };
    }, [isSupported]);

    return {
        isSupported,
        token,
        loading,
        error,
        requestPermission,
        registerTokenWithBackend,
    };
};
