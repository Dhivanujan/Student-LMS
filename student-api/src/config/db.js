const mongoose = require("mongoose");
const User = require("../models/User");

/**
 * CONNECT DB
 * Asynchronous function to establish connection with MongoDB and seed the superadmin
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}\n`);
        
        // Seed Superadmin user if no admins exist
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            console.log("🛠 No Admin accounts detected. Seeding default Superadmin user...");
            await User.create({
                name: "System Administrator",
                email: "admin@unilms.edu",
                password: "Admin@12345", // Hashed in pre-save hook
                role: "admin",
                firstLogin: false,
                isActive: true,
                department: "Administration",
                registrationNumber: "ADMIN-001"
            });
            console.log("✅ Superadmin seeded successfully!");
            console.log("👉 Email: admin@unilms.edu | Password: Admin@12345\n");
        }

    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;