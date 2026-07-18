import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["patient", "hospital", "doctor", "admin"],
            default: "patient",
        },
        // models/User.js - Add this field
        fcmTokens: [
            {
                token: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
                isActive: { type: Boolean, default: true },
            },
        ],
        isVerified: {
            type: Boolean,
            default: true,
        },

        verificationStatus: {
            type: String,
            enum: ["approved", "pending", "rejected"],
            default: "approved",
        },

        verificationDocs: [String],
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);
