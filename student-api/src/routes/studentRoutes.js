// ============================================
// STUDENT ROUTES - All student endpoints
// ============================================

const express = require("express");
const router = express.Router();

// Import controllers
const { registerStudent, loginStudent, getCurrentStudent } = require("../controllers/studentController");

// Import middleware guards
const { protect } = require("../middleware/authMiddleware");

// Import validation middlewares
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");

// ============================================
// ROUTE DEFINITIONS
// ============================================

// POST Register a student
// Example: POST /api/students/register
router.post("/register", validateRegister, registerStudent);

// POST Login a student
// Example: POST /api/students/login
router.post("/login", validateLogin, loginStudent);

// GET Current logged-in student details
// Example: GET /api/students/me
router.get("/me", protect, getCurrentStudent);

module.exports = router;