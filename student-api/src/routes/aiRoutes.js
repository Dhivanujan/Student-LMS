const express = require("express");
const router = express.Router();
const { chat, generateQuiz, evaluateSubmission } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Student AI Academic Assistant (chat)
router.post("/chat", protect, chat);

// Lecturer AI Quiz Generator
router.post("/generate-quiz", protect, authorize("lecturer", "admin"), generateQuiz);

// Lecturer AI Submission Evaluator
router.post("/evaluate-submission", protect, authorize("lecturer", "admin"), evaluateSubmission);

module.exports = router;
