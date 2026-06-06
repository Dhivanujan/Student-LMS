// ============================================
// COURSE ROUTES - All course endpoints
// ============================================

const express = require("express");
const router = express.Router();

// Import controllers
const {
    getCourses,
    createCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse
} = require("../controllers/courseController");

// Import middleware guards
const { protect, authorize } = require("../middleware/authMiddleware");

// Import validation middleware
const { validateCourse } = require("../middleware/validationMiddleware");

// ============================================
// ROUTE DEFINITIONS
// ============================================

// Get all courses (Any logged-in user can access)
router.get("/", protect, getCourses);

// Create a course (Admin only)
router.post("/", protect, authorize("admin"), validateCourse, createCourse);

// Delete a course (Admin only)
router.delete("/:id", protect, authorize("admin"), deleteCourse);

// Enroll in a course (Student only)
router.post("/:id/enroll", protect, authorize("student"), enrollInCourse);

// Unenroll from a course (Student only)
router.post("/:id/unenroll", protect, authorize("student"), unenrollFromCourse);

module.exports = router;
