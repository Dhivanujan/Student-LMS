const express = require("express");
const router = express.Router();
const { createQuiz, addQuestions, getQuizzesByCourse, startQuizAttempt, submitQuizAttempt, gradeQuizResult, getQuizResults } = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("lecturer", "admin"), createQuiz);
router.post("/:id/questions", protect, authorize("lecturer", "admin"), addQuestions);
router.get("/course/:courseId", protect, getQuizzesByCourse);

router.post("/:id/attempt", protect, authorize("student"), startQuizAttempt);
router.post("/:id/submit", protect, authorize("student"), submitQuizAttempt);

router.put("/result/:resultId/grade", protect, authorize("lecturer", "admin"), gradeQuizResult);
router.get("/:id/results", protect, getQuizResults);

module.exports = router;
