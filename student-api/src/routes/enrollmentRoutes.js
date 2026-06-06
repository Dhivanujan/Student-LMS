const express = require("express");
const router = express.Router();
const { requestEnrollment, getEnrollments, approveEnrollment, rejectEnrollment, getMyEnrolledCourses } = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/request", protect, authorize("student"), requestEnrollment);
router.get("/", protect, authorize("admin", "lecturer"), getEnrollments);
router.put("/:id/approve", protect, authorize("admin"), approveEnrollment);
router.put("/:id/reject", protect, authorize("admin"), rejectEnrollment);
router.get("/student/me", protect, authorize("student"), getMyEnrolledCourses);

module.exports = router;
