const express = require("express");
const router = express.Router();
const { createAssignment, getAssignmentsByCourse, getAssignmentById, submitAssignment, gradeSubmission } = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, authorize("lecturer", "admin"), upload.single("assignmentFile"), createAssignment);
router.get("/course/:courseId", protect, getAssignmentsByCourse);
router.get("/:id", protect, getAssignmentById);
router.post("/:id/submit", protect, authorize("student"), upload.single("submissionFile"), submitAssignment);
router.put("/submission/:submissionId/grade", protect, authorize("lecturer", "admin"), gradeSubmission);

module.exports = router;
