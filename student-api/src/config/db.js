// ============================================
// DATABASE CONFIGURATION - MongoDB Connection
// ============================================

const mongoose = require("mongoose");

/**
 * CONNECT DB
 * Asynchronous function to establish connection with MongoDB
 */
const connectDB = async () => {
    try {
        // Attempt to connect using the URI from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}\n`);
        
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure (1) if connection fails
        process.exit(1);
    }
};

module.exports = connectDB;