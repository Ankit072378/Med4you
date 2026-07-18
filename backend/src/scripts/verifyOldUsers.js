import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const result = await User.updateMany(
    { role: { $in: ["doctor", "hospital","patient"] } },
    {
        $set: {
            isVerified: true,
            verificationStatus: "approved",
        },
    }
);

console.log("Users verified:", result.modifiedCount);

await mongoose.disconnect();
process.exit();