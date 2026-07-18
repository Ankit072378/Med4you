// scripts/seedDemo.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import your models
const Patient = (await import("../models/Patient.js")).default;
const FamilyUser = (await import("../models/FamilyUser.js")).default;

async function seedDemo() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || "your-mongodb-connection-string"
        );

        console.log("Connected to MongoDB");

        // Create a demo patient
        const patient = await Patient.create({
            userId: new mongoose.Types.ObjectId(),
            name: "Rahul Verma",
            age: "45",
            gender: "Male",
            bloodGroup: "O+",
            address: "Room 305, Ward B, Apollo Hospital, Mumbai",
            emergencyContacts: [
                {
                    name: "Priya Verma",
                    phone: "9876543210",
                    relation: "Wife",
                },
            ],
        });

        console.log("Patient created:", patient.name);

        // Create family credentials
        const family = await FamilyUser.create({
            userId: "FAMILY001",
            password: "demo123", // Will be hashed automatically
            patientId: patient._id,
            patientName: patient.name,
        });

        console.log("Family user created!");
        console.log("\n✅ Demo data created successfully!");
        console.log("\n📝 Login Credentials:");
        console.log("   User ID: FAMILY001");
        console.log("   Password: demo123");
        console.log(`   Patient: ${patient.name}\n`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seedDemo();
