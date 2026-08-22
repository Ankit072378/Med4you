// models/FamilyUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const familyUserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        patientName: String,
    },
    { timestamps: true }
);

familyUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
});

export default mongoose.model("FamilyUser", familyUserSchema);