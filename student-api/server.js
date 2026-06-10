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

const path = require("path");

// Import route files
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const announcementRoutes = require("./src/routes/announcementRoutes");
const forumRoutes = require("./src/routes/forumRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const examRoutes = require("./src/routes/examRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
const quizRoutes = require("./src/routes/quizRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const errorHandler = require("./src/middleware/errorMiddleware");

// Mount routes at specific paths
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/ai", aiRoutes);

// Static uploads serving
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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