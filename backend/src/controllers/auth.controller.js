import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });
}
function sendToken(res, token) {
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
}

export async function login(req, res) {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required." });
        }
        const user = await User.findOne({ phone });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "User does not exist." });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(400).json({
                success: false,
                message: "Incorrect Password or Phone",
            });
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is under verification. Please wait for admin approval.",
            });
        }
        const token = generateToken(user._id);
        sendToken(res, token);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in login controller :" + error.message,
        });
    }
}

export async function patientSignup(req, res) {
    try {
        const {
            phone,
            password,
            name,
            age,
            gender,
            bloodGroup,
            address,
            emergencyContacts,
        } = req.body;
        if (
            !phone ||
            !password ||
            !name ||
            !age ||
            !gender ||
            !bloodGroup ||
            !address
        ) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }
        const existingUser = await User.findOne({ phone });
        if (existingUser)
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        const newUser = await User.create({
            phone,
            password,
            role: "patient",
            isVerified: true,
            verificationStatus: "approved",
        });
        const newPatient = await Patient.create({
            userId: newUser._id,
            name,
            age,
            gender,
            bloodGroup,
            address,
            emergencyContacts,
        });
        if (!newPatient)
            return res.status(500).json({
                success: false,
                message: "Patient was not created.Try again later",
            });
        const token = generateToken(newUser._id);
        sendToken(res, token);
        res.status(200).json({ success: true, data: newPatient });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in signup controller :" + error.message,
        });
    }
}

export async function doctorSignup(req, res) {
    try {
        const {
            phone,
            password,
            name,
            age,
            gender,
            type, // main specialization
            experience,
            fee,
            qualifications,
            specializations,
            languages,
            about,
            city,
            address,
            contact, // { phone, email, whatsapp }
            educationTimeline, // array of objects
            schedule, // weekly schedule
            hospitals, // array of hospital IDs (required)
        } = req.body;

        // Required validation (matching your schema)
        if (!phone || !password || !name || !type || !experience || !fee) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check existing
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user
        const newUser = await User.create({
            phone,
            password,
            role: "doctor",
            isVerified: false,
            verificationStatus: "pending",
        });

        // Create doctor
        const newDoctor = await Doctor.create({
            userId: newUser._id,
            name,
            age, // string in schema
            gender,
            type,
            experience,
            fee,
            qualifications: qualifications || [],
            specializations: specializations || [],
            languages: languages || [],
            about,
            city,
            address,
            contact,
            hospitals: hospitals || [], // required array
            educationTimeline: educationTimeline || [],
            schedule: schedule || [],
        });

        res.status(201).json({
            success: true,
            message:
                "Signup submitted. Upload documents. You can login after admin verification.",
            data: {
                userId: newUser._id,
                doctorId: newDoctor._id,
            },
        });
    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Error in doctorSignup: " + error.message,
        });
    }
}

export async function hospitalSignup(req, res) {
    try {
        const {
            phone,
            password,
            name,
            address,
            city,
            location,
            specialities = [],
            beds = [],
            doctorIds = [],
            contacts,
            photo = [],
        } = req.body;

        // Basic required validation
        if (!phone || !password || !name || !city || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        if (!location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: "Location must include lat and lng",
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user
        const newUser = await User.create({
            phone,
            password,
            role: "hospital",
            isVerified: false,
            verificationStatus: "pending",
        });

        // Create hospital
        const newHospital = await Hospital.create({
            userId: newUser._id,
            name,
            address,
            city,
            location,
            specialities,
            beds,
            doctorIds,
            contacts,
            photo,
        });

        res.status(201).json({
            success: true,
            message:
                "Hospital registered. Upload verification documents. Login will be enabled after admin approval.",
            data: {
                userId: newUser._id,
                hospitalId: newHospital._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in hospitalSignup: " + error.message,
        });
    }
}

export async function adminSignup(req, res) {
    try {
        const { phone, password } = req.body;
        // Basic required validation
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        // Create user
        const newUser = await User.create({
            phone,
            password,
            role: "admin",
            isVerified: true,
            verificationStatus: "approved",
        });
        if (!newUser) return res.status(500).json({ message: "Admin was not created" });
        const token = generateToken(newUser._id);
        sendToken(res, token);
        return res.status(201).json({
            success: true, message: "Successfully registered admin",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in adminSignup controller :" + error.message,
        });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("jwt");
        res.status(200).json({ success: true, message: "Logout Successfull" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in logout controller :" + error.message,
        });
    }
}

export async function postProfilePhoto(req, res) {
    try {
        if (!req.images || req.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No such user exists",
            });
        }
        let updatedProfile = null;
        if (user.role === "doctor") {
            updatedProfile = await Doctor.findOneAndUpdate(
                { _id: req.doctor._id },
                { profilePhoto: req.images[0] },
                { new: true }
            );
            console.log(req.doctor);
        } else if (user.role === "patient") {
            updatedProfile = await Patient.findOneAndUpdate(
                { _id: req.patient._id },
                { profilePhoto: req.images[0] },
                { new: true }
            );
        }

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found to update",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile Photo updated Successfully",
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in postProfilePhoto controller: " + error.message,
        });
    }
}

export async function postPhotos(req, res) {
    try {
        if (!req.images || req.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images uploaded",
            });
        }
        if (!req.hospital || !req.hospital._id) {
            console.log("❌ Hospital context missing");
            console.log("req.user:", req.user);
            console.log("req.hospital:", req.hospital);

            return res.status(400).json({
                success: false,
                message: "Hospital context missing",
            });
        }

        const updatedProfile = await Hospital.findByIdAndUpdate(
            req.hospital._id,
            {
                $push: {
                    photo: { $each: req.images },
                },
            },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Hospital profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Photos uploaded successfully",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("🔥 postPhotos error:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading hospital photos",
            error: error.message,
        });
    }
}


export const uploadVerificationDocs = async (req, res, next) => {
    try {
        console.log("🔵 uploadVerificationDocs START");

        const { userId } = req.params;
        console.log("🧾 userId:", userId);

        console.log("🖼 req.images:", req.images);

        if (!req.images || req.images.length === 0) {
            console.log("❌ No images found");
            return res.status(400).json({ message: "Documents required" });
        }

        console.log("🔍 Finding user in DB...");
        const user = await User.findById(userId);

        console.log("👤 User found:", user);

        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "Invalid user" });
        }

        console.log("✍️ Saving verification data...");
        user.verificationDocs = req.images;
        user.verificationStatus = "pending";
        user.isVerified = false;

        await user.save();

        console.log("✅ User updated successfully");

        return res.json({
            success: true,
            message: "Documents uploaded. Admin will verify soon.",
        });
    } catch (err) {
        console.log("🔥 uploadVerificationDocs ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};

export const addFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user._id;

        if (!fcmToken) {
            return res.status(400).json({ error: "FCM token required" });
        }

        // Remove old inactive tokens for this device (keep only latest)
        await User.updateOne(
            { _id: userId },
            {
                $pull: {
                    fcmTokens: {
                        token: fcmToken,
                        isActive: false,
                    },
                },
            }
        );

        // Upsert new token
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    fcmTokens: {
                        token: fcmToken,
                        isActive: true,
                        createdAt: new Date(),
                    },
                },
            },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "FCM token registered successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const removeFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user._id;

        const result = await User.updateOne(
            { _id: userId },
            { $pull: { fcmTokens: { token: fcmToken } } }
        );

        res.status(200).json({
            success: true,
            message: "FCM token removed",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
