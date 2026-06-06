// ============================================
// ENTRY POINT - Starts the entire server
// ============================================

require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE LAYER - Process every request
// ============================================

// Connect to MongoDB (runs once on startup)
connectDB();

// Allow frontend apps to communicate with this backend
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// ============================================
// ROUTES LAYER - Define API endpoints
// ============================================

// Import route files
const studentRoutes = require("./src/routes/studentRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const errorHandler = require("./src/middleware/errorMiddleware");

// Mount routes at specific paths
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);

// Health check endpoint (for testing if server is running)
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running ✅" });
});

// Register global error handling middleware (must be registered after routes)
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server started on http://localhost:${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
});