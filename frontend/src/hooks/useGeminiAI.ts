import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CACHE_KEY = "gemini_health_analysis";
const SORT_PREFERENCE_KEY = "health_sort_preference";
const CONVERSATION_KEY = "gemini_conversation_history";
const SESSION_KEY = "gemini_session_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useGeminiAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cachedResults, setCachedResults] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [sortPreference, setSortPreference] = useState({
        cost: 1,
        distance: 1,
        rating: 1,
        beds: 1,
    });

    // Load cached data, conversation history, and sort preferences on mount
    useEffect(() => {
        const loadCachedData = () => {
            try {
                const sessionTimestamp = localStorage.getItem(SESSION_KEY);
                const now = Date.now();

                if (sessionTimestamp) {
                    const sessionAge = now - parseInt(sessionTimestamp);
                    if (sessionAge >= CACHE_DURATION) {
                        clearAllStorage();
                        console.log(
                            "Session expired (24 hours), cleared all data"
                        );
                        return;
                    }
                } else {
                    localStorage.setItem(SESSION_KEY, now.toString());
                }

                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (now - timestamp < CACHE_DURATION) {
                        setCachedResults(data);
                        console.log("Loaded cached results from localStorage");
                    } else {
                        localStorage.removeItem(CACHE_KEY);
                    }
                }

                const savedConversation =
                    localStorage.getItem(CONVERSATION_KEY);
                if (savedConversation) {
                    const { messages, timestamp } =
                        JSON.parse(savedConversation);
                    if (now - timestamp < CACHE_DURATION) {
                        setConversationHistory(messages);
                        console.log(
                            `Loaded ${messages.length} messages from conversation history`
                        );
                    } else {
                        localStorage.removeItem(CONVERSATION_KEY);
                    }
                }

                const savedPrefs = localStorage.getItem(SORT_PREFERENCE_KEY);
                if (savedPrefs) {
                    setSortPreference(JSON.parse(savedPrefs));
                }
            } catch (err) {
                console.error("Error loading cached data:", err);
                clearAllStorage();
            }
        };

        loadCachedData();
    }, []);

    useEffect(() => {
        if (conversationHistory.length > 0) {
            try {
                const conversationData = {
                    messages: conversationHistory,
                    timestamp: Date.now(),
                };
                localStorage.setItem(
                    CONVERSATION_KEY,
                    JSON.stringify(conversationData)
                );
            } catch (err) {
                console.error("Error saving conversation history:", err);
            }
        }
    }, [conversationHistory]);

    const clearAllStorage = () => {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CONVERSATION_KEY);
        localStorage.removeItem(SESSION_KEY);
        setCachedResults(null);
        setConversationHistory([]);
    };

    const saveToCache = (data) => {
        try {
            const cacheData = { data, timestamp: Date.now() };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            setCachedResults(data);
        } catch (err) {
            console.error("Error saving to cache:", err);
        }
    };

    const clearCache = () => clearAllStorage();
    const addToConversation = (message) =>
        setConversationHistory((prev) => [...prev, message]);
    const clearConversation = () => {
        setConversationHistory([]);
        localStorage.removeItem(CONVERSATION_KEY);
    };

    const updateSortPreference = (newPrefs) => {
        const updated = { ...sortPreference, ...newPrefs };
        setSortPreference(updated);
        localStorage.setItem(SORT_PREFERENCE_KEY, JSON.stringify(updated));
        if (cachedResults) {
            const resorted = applySorting(cachedResults, updated);
            saveToCache(resorted);
        }
    };

    // ROBUST JSON EXTRACTION - Handles all Gemini response formats
    const extractJSON = (text) => {
        // Method 1: Try direct parse first
        try {
            return JSON.parse(text);
        } catch (e) {
            // Continue to other methods
        }

        // Method 2: Remove markdown code blocks (`````` or ``````)
        let cleaned = text.replace(/^``````\s*$/gm, "").trim();
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            // Continue
        }

        // Method 3: Extract JSON object using regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                // Continue
            }
        }

        // Method 4: Remove all backticks and try again
        cleaned = text.replace(/`/g, "").trim();
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            throw new Error("Failed to extract valid JSON from response");
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const scoreHospital = (
        hospital,
        userLocation,
        urgency,
        userCity,
        preferences,
        patientProfile = null
    ) => {
        let score = 0;

        // EMERGENCY PRIORITIZATION
        if (urgency === "emergency") {
            const bedAvailability =
                hospital.availableBeds / Math.max(hospital.totalBeds, 1);
            score += bedAvailability * 40; // Bed availability is critical

            // Distance is paramount in emergencies
            if (patientProfile?.address && hospital.city) {
                const patientCity = patientProfile.address
                    .split(",")
                    .pop()
                    .trim()
                    .toLowerCase();
                const hospitalCity = hospital.city.toLowerCase();
                if (
                    patientCity.includes(hospitalCity) ||
                    hospitalCity.includes(patientCity)
                ) {
                    score += 50; // Huge boost for same city
                }
            }

            if (userLocation && hospital.location?.coordinates) {
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    hospital.location.coordinates[1],
                    hospital.location.coordinates[0]
                );
                score += Math.max(0, 50 - distance * 15); // Heavy distance penalty
                hospital.distance = parseFloat(distance.toFixed(2));
            }

            score += (hospital.rating || 0) * 3; // Rating matters less
            return score;
        }

        // HIGH URGENCY
        if (urgency === "high") {
            const bedAvailability =
                hospital.availableBeds / Math.max(hospital.totalBeds, 1);
            score += bedAvailability * 25 * preferences.beds;

            if (patientProfile?.address && hospital.city) {
                const patientCity = patientProfile.address
                    .split(",")
                    .pop()
                    .trim()
                    .toLowerCase();
                if (hospital.city.toLowerCase().includes(patientCity)) {
                    score += 30;
                }
            }

            if (userLocation && hospital.location?.coordinates) {
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    hospital.location.coordinates[1],
                    hospital.location.coordinates[0]
                );
                score += Math.max(0, 30 - distance * 5);
                hospital.distance = parseFloat(distance.toFixed(2));
            }

            score += (hospital.rating || 0) * 5 * preferences.rating;

            if (
                patientProfile?.bloodGroup &&
                hospital.specialities?.some((s) =>
                    s.toLowerCase().includes("blood bank")
                )
            ) {
                score += 15;
            }
            return score;
        }

        // NORMAL PRIORITIZATION (medium/low urgency)
        score += (hospital.rating || 0) * 8 * preferences.rating;

        const bedAvailability =
            hospital.availableBeds / Math.max(hospital.totalBeds, 1);
        score += bedAvailability * 30 * preferences.beds;

        let locationScore = 0;
        if (patientProfile?.address && hospital.city) {
            const patientCity = patientProfile.address
                .split(",")
                .pop()
                .trim()
                .toLowerCase();
            if (hospital.city.toLowerCase().includes(patientCity)) {
                locationScore += 20;
            }
        }

        if (userLocation && hospital.location?.coordinates) {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hospital.location.coordinates[1],
                hospital.location.coordinates[0]
            );
            locationScore += Math.max(0, 30 - distance * 2);
            hospital.distance = parseFloat(distance.toFixed(2));
        } else if (userCity && hospital.city) {
            locationScore +=
                hospital.city.toLowerCase() === userCity.toLowerCase()
                    ? 30
                    : 10;
        }
        score += locationScore * preferences.distance;

        // Age-based matching
        if (patientProfile?.age) {
            const age = parseInt(patientProfile.age);
            if (
                age > 60 &&
                hospital.specialities?.some((s) =>
                    s.toLowerCase().includes("geriatric")
                )
            ) {
                score += 15;
            } else if (
                age < 18 &&
                hospital.specialities?.some((s) =>
                    s.toLowerCase().includes("pediatric")
                )
            ) {
                score += 15;
            }
        }

        // Gender-based matching
        if (
            patientProfile?.gender?.toLowerCase() === "female" &&
            hospital.specialities?.some((s) =>
                s.toLowerCase().includes("gynecology")
            )
        ) {
            score += 8;
        }

        // Cost consideration for non-urgent
        if (urgency === "low" || urgency === "medium") {
            score += 5 * preferences.cost;
        }

        return score;
    };

    const scoreDoctor = (
        doctor,
        userLocation,
        urgency,
        userCity,
        preferences,
        patientProfile = null
    ) => {
        let score = 0;

        // EMERGENCY PRIORITIZATION
        if (urgency === "emergency") {
            score +=
                doctor.currentStatus === "available"
                    ? 50
                    : doctor.currentStatus === "busy"
                    ? 10
                    : 0;
            score += Math.min(doctor.experience * 2, 35);

            if (patientProfile?.address && doctor.city) {
                const patientCity = patientProfile.address
                    .split(",")
                    .pop()
                    .trim()
                    .toLowerCase();
                if (doctor.city.toLowerCase().includes(patientCity)) {
                    score += 15;
                }
            }
            return score;
        }

        // HIGH URGENCY
        if (urgency === "high") {
            score +=
                doctor.currentStatus === "available"
                    ? 30
                    : doctor.currentStatus === "busy"
                    ? 12
                    : 0;
            score += Math.min(doctor.experience, 25);
            score += (doctor.rating || 0) * 5 * preferences.rating;

            if (patientProfile?.address && doctor.city) {
                const patientCity = patientProfile.address
                    .split(",")
                    .pop()
                    .trim()
                    .toLowerCase();
                if (doctor.city.toLowerCase().includes(patientCity)) {
                    score += 15 * preferences.distance;
                }
            }
            return score;
        }

        // NORMAL PRIORITIZATION
        score += (doctor.rating || 0) * 6 * preferences.rating;
        score += Math.min(doctor.experience, 25);
        score +=
            doctor.currentStatus === "available"
                ? 25
                : doctor.currentStatus === "busy"
                ? 10
                : 0;

        // Cost consideration
        const avgFee = 500;
        const costScore = Math.max(
            0,
            25 - ((doctor.fee - avgFee) / avgFee) * 15
        );
        score += costScore * preferences.cost;

        // Location matching
        if (patientProfile?.address && doctor.city) {
            const patientCity = patientProfile.address
                .split(",")
                .pop()
                .trim()
                .toLowerCase();
            if (doctor.city.toLowerCase().includes(patientCity)) {
                score += 15 * preferences.distance;
            }
        } else if (userCity && doctor.city) {
            score +=
                (doctor.city.toLowerCase() === userCity.toLowerCase()
                    ? 20
                    : 8) * preferences.distance;
        }

        // Age/gender matching
        if (patientProfile) {
            const age = patientProfile.age
                ? parseInt(patientProfile.age)
                : null;
            if (
                age &&
                age > 60 &&
                doctor.type?.toLowerCase().includes("geriatric")
            )
                score += 15;
            if (
                age &&
                age < 18 &&
                doctor.type?.toLowerCase().includes("pediatric")
            )
                score += 15;
            if (
                patientProfile.gender?.toLowerCase() === "female" &&
                (doctor.type?.toLowerCase().includes("gynecologist") ||
                    doctor.type?.toLowerCase().includes("obstetrician"))
            ) {
                score += 10;
            }
        }

        return score;
    };

    const applySorting = (results, preferences) => {
        const { userLocation, userCity, patientProfile, urgency } = results;

        const resortedHospitals = results.hospitals
            .map((hospital) => ({
                ...hospital,
                score: scoreHospital(
                    hospital,
                    userLocation,
                    urgency,
                    userCity,
                    preferences,
                    patientProfile
                ),
            }))
            .sort((a, b) => b.score - a.score);

        const resortedDoctors = results.doctors
            .map((doctor) => ({
                ...doctor,
                score: scoreDoctor(
                    doctor,
                    userLocation,
                    urgency,
                    userCity,
                    preferences,
                    patientProfile
                ),
            }))
            .sort((a, b) => b.score - a.score);

        return {
            ...results,
            hospitals: resortedHospitals,
            doctors: resortedDoctors,
        };
    };

    const analyzeHealthQuery = async (
        userQuery,
        hospitals,
        doctors,
        userLocation = null,
        userCity = null,
        patientProfile = null
    ) => {
        setLoading(true);
        setError(null);

        try {
            if (!API_KEY) throw new Error("Gemini API key is not configured");

            const ai = new GoogleGenAI({ apiKey: API_KEY });

            // ENHANCED hospital context with explicit emergency indicators
            const hospitalContext = hospitals.map((h) => ({
                id: h._id,
                name: h.name,
                city: h.city,
                address: h.address,
                specialities: h.specialities || [],
                hasEmergencyContact: !!h.contacts?.emergency?.length, // NEW: Explicit flag
                availableBeds:
                    h.beds?.filter((b) => b.status === "available").length || 0,
                totalBeds: h.beds?.length || 0,
                rating: h.averageRating || 0,
                emergencyContacts: h.contacts?.emergency || [], // NEW: Include actual numbers
            }));

            const doctorContext = doctors.map((d) => ({
                id: d._id,
                name: d.name,
                type: d.type,
                specializations: d.specializations,
                experience: d.experience,
                fee: d.fee,
                city: d.city,
                rating: d.averageRating || 0,
                currentStatus: d.currentStatus,
            }));

            const prompt = `You are a world-class healthcare AI assistant. Analyze medical queries and provide expert recommendations.

FOR EMERGENCIES (accidents, trauma, heart attack, stroke, severe bleeding, unconscious, burns, chest pain, can't breathe): ALWAYS recommend 3-5 hospitals FIRST with available beds and/or emergency contacts. Do NOT skip hospitals.

${
    patientProfile
        ? `PATIENT CONTEXT (use this to optimize recommendations, NOT as the main focus):
Age: ${patientProfile.age}y | Gender: ${patientProfile.gender} | Blood: ${patientProfile.bloodGroup} | Location: ${patientProfile.address}
`
        : ""
}
USER QUERY: "${userQuery}"

HOSPITALS (ALL have emergency capability if they have beds/emergency contacts): ${JSON.stringify(
                hospitalContext
            )}
DOCTORS: ${JSON.stringify(doctorContext)}

EMERGENCY CLASSIFICATION:
- "emergency": Accidents, trauma, severe bleeding, heart attack, stroke, unconscious, severe burns, can't breathe, severe chest pain → ALWAYS recommend hospitals with availableBeds >0 OR hasEmergencyContact=true. Nearest first.
- "high": Severe pain, high fever >103°F, suspected fractures, severe infections
- "medium": Persistent symptoms, moderate pain
- "low": Routine checkups

ANALYSIS STEPS:
1. Identify PRIMARY medical need
2. Classify urgency
3. Select specialty
4. ALWAYS RECOMMEND 3-5 HOSPITALS: For emergency - prioritize availableBeds, hasEmergencyContact, proximity. Use hospital IDs exactly.
5. Recommend 3-5 doctors
6. ${
                patientProfile
                    ? `Consider age ${patientProfile.age}, gender ${patientProfile.gender}`
                    : ""
            }

Respond with ONLY valid JSON (no markdown):
{
  "analysis": "Clear description of medical need and urgency",
  "urgency": "emergency|high|medium|low",
  "recommendedSpecialty": "Emergency Medicine/Cardiology/etc",
  "hospitals": [{"id": "exact_hospital_id", "reason": "Why (mention beds/emergency)", "priority": 1}],
  "doctors": [{"id": "exact_doctor_id", "reason": "Why", "priority": 1}],
  "additionalAdvice": "Brief advice (EMERGENCY: Go to nearest ER immediately)"
}

CRITICAL: 
- Use ONLY IDs from HOSPITALS array
- For EMERGENCY: Pick hospitals with availableBeds>0 OR hasEmergencyContact=true. Never empty list.
- Prioritize QUERY symptoms over patient profile`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    temperature: 0.3, // Lower for more reliable JSON
                    topK: 30,
                    topP: 0.9,
                    maxOutputTokens: 2048,
                },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            let text = response.text;
            console.log("🔍 Raw AI Response:", text);

            let aiResponse;
            try {
                aiResponse = extractJSON(text);
                console.log("✅ Parsed AI Response:", aiResponse);
            } catch (parseError) {
                console.error("❌ JSON Parse Failed:", parseError);

                // IMPROVED FALLBACK - Always provide hospitals for emergency
                const emergencyKeywords = [
                    "accident",
                    "crash",
                    "burn",
                    "injury",
                    "trauma",
                    "bleeding",
                    "unconscious",
                    "heart attack",
                    "stroke",
                    "chest pain",
                    "can't breathe",
                    "emergency",
                ];
                const isEmergency = emergencyKeywords.some((kw) =>
                    userQuery.toLowerCase().includes(kw)
                );

                // Filter hospitals: Prioritize emergency-ready (beds + contacts)
                const emergencyHospitals = hospitals
                    .filter((h) => {
                        const hasBeds =
                            (h.beds?.filter((b) => b.status === "available")
                                .length || 0) > 0;
                        const hasEmergency = h.contacts?.emergency?.length > 0;
                        return hasBeds || hasEmergency;
                    })
                    .sort((a, b) => {
                        // Prioritize more beds, then contacts
                        const aScore =
                            (a.beds?.filter((b) => b.status === "available")
                                .length || 0) *
                                10 +
                            (a.contacts?.emergency?.length || 0);
                        const bScore =
                            (b.beds?.filter((b) => b.status === "available")
                                .length || 0) *
                                10 +
                            (b.contacts?.emergency?.length || 0);
                        return bScore - aScore;
                    })
                    .slice(0, 5);

                // Fallback to all if no perfect matches (ensures list never empty)
                const fallbackHospitals =
                    emergencyHospitals.length > 0
                        ? emergencyHospitals
                        : hospitals.slice(0, 5);

                let specialty = "Emergency Medicine";
                if (
                    userQuery.toLowerCase().includes("heart") ||
                    userQuery.toLowerCase().includes("cardio")
                )
                    specialty = "Cardiology";

                aiResponse = {
                    analysis: `${
                        isEmergency ? "⚠️ EMERGENCY DETECTED: " : ""
                    }Immediate medical attention needed for ${specialty}.${
                        patientProfile
                            ? ` Patient: ${patientProfile.age}y ${patientProfile.gender}`
                            : ""
                    }`,
                    urgency: isEmergency ? "emergency" : "high",
                    recommendedSpecialty: specialty,
                    hospitals: fallbackHospitals.map((h, i) => ({
                        id: h._id,
                        reason: `Emergency-ready: ${
                            h.beds?.filter((b) => b.status === "available")
                                .length || 0
                        } beds available, emergency contact available${
                            patientProfile
                                ? ` near ${patientProfile.address}`
                                : ""
                        }`,
                        priority: i + 1,
                    })),
                    doctors: doctors
                        .filter((d) => d.currentStatus === "available")
                        .slice(0, 5)
                        .map((d, i) => ({
                            id: d._id,
                            reason: `${d.type}, ${d.experience}y exp, available`,
                            priority: i + 1,
                        })),
                    additionalAdvice: isEmergency
                        ? "⚠️ EMERGENCY: Go to nearest hospital NOW or call 108/ambulance. Do not delay."
                        : "Seek medical consultation promptly.",
                };
                console.log("🔄 Using improved fallback:", aiResponse);
            }

            // Enrich/score (unchanged, but now hospitals always populated)
            const enrichedHospitals = (aiResponse.hospitals || [])
                .map((rec) => {
                    const hospital = hospitals.find((h) => h._id === rec.id);
                    if (!hospital) return null;
                    return {
                        ...hospital,
                        reason: rec.reason,
                        aiPriority: rec.priority,
                        availableBeds:
                            hospital.beds?.filter(
                                (b) => b.status === "available"
                            ).length || 0,
                        totalBeds: hospital.beds?.length || 0,
                        rating: hospital.averageRating || 0,
                    };
                })
                .filter(Boolean)
                .map((hospital) => ({
                    ...hospital,
                    score: scoreHospital(
                        hospital,
                        userLocation,
                        aiResponse.urgency,
                        userCity,
                        sortPreference,
                        patientProfile
                    ),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            const enrichedDoctors = (aiResponse.doctors || [])
                .map((rec) => {
                    const doctor = doctors.find((d) => d._id === rec.id);
                    return doctor
                        ? {
                              ...doctor,
                              reason: rec.reason,
                              aiPriority: rec.priority,
                              rating: doctor.averageRating || 0,
                          }
                        : null;
                })
                .filter(Boolean)
                .map((doctor) => ({
                    ...doctor,
                    score: scoreDoctor(
                        doctor,
                        userLocation,
                        aiResponse.urgency,
                        userCity,
                        sortPreference,
                        patientProfile
                    ),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            const enrichedResponse = {
                ...aiResponse,
                hospitals: enrichedHospitals,
                doctors: enrichedDoctors,
                userQuery,
                userLocation,
                userCity,
                patientProfile,
                queriedAt: new Date().toISOString(),
            };

            console.log(
                "🏥 Final Hospitals (should never be empty for emergency):",
                enrichedHospitals.length
            );
            saveToCache(enrichedResponse);
            addToConversation({
                id: Date.now().toString(),
                query: userQuery,
                response: enrichedResponse,
                timestamp: new Date().toISOString(),
            });

            return { success: true, data: enrichedResponse };
        } catch (err) {
            if (error.message.includes("503")) {
                return {
                    success: true,
                    data: {
                        analysis:
                            "AI servers are busy. Showing nearest hospitals based on your location.",
                        urgency: "high",
                        hospitals: hospitals
                            .sort((a, b) => a.distance - b.distance)
                            .slice(0, 5),
                        doctors: [],
                        additionalAdvice:
                            "Please visit the nearest emergency hospital immediately.",
                    },
                };
            }

            console.error("Gemini AI Error:", err);
            setError(err.message || "AI analysis failed.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };


    const analyzeSymptoms = async (symptoms) => {
        setLoading(true);
        setError(null);

        try {
            if (!API_KEY) throw new Error("Gemini API key is not configured");

            const ai = new GoogleGenAI({ apiKey: API_KEY });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    temperature: 0.5,
                    topK: 20,
                    topP: 0.9,
                    maxOutputTokens: 512,
                },
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Analyze symptoms: ${symptoms}\n\nRespond with JSON only:\n{"possibleConditions":[],"recommendedSpecialty":"","urgency":"","advice":""}`,
                            },
                        ],
                    },
                ],
            });

            const analysis = extractJSON(response.text);
            return { success: true, data: analysis };
        } catch (err) {
            console.error("Symptom Analysis Error:", err);
            setError(err.message || "Symptom analysis failed");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        analyzeHealthQuery,
        analyzeSymptoms,
        cachedResults,
        conversationHistory,
        clearCache,
        clearConversation,
        sortPreference,
        updateSortPreference,
        loading,
        error,
        clearError,
    };
}
