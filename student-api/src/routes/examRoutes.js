const express = require("express");
const router = express.Router();
const {
    createExam,
    getExams,
    enterMarks,
    publishResults,
    getExamResults,
    getStudentReportCard,
    generateTranscript
} = require("../controllers/examController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All exam routes require user login
router.use(protect);

router.route("/")
    .post(authorize("admin", "lecturer"), createExam)
    .get(getExams);

router.route("/report-card")
    .get(getStudentReportCard);

router.route("/:examId/marks")
    .post(authorize("admin", "lecturer"), enterMarks);

router.route("/:examId/publish")
    .post(authorize("admin", "lecturer"), publishResults);

router.route("/:examId/results")
    .get(getExamResults);

router.route("/student/:studentId/transcript")
    .get(generateTranscript);

module.exports = router;
