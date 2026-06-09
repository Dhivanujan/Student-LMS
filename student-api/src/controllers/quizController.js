const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Result = require("../models/Result");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Notification = require("../models/Notification");

// ============================================
// CREATE QUIZ (Lecturer only)
// ============================================
exports.createQuiz = async (req, res) => {
    try {
        const { courseId, title, description, durationMinutes, dueDate } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Authorize
        if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const quiz = await Quiz.create({
            courseId,
            title,
            description,
            durationMinutes,
            dueDate
        });

        res.status(201).json({ success: true, message: "Quiz created successfully!", data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// ADD QUESTIONS (Lecturer only)
// ============================================
exports.addQuestions = async (req, res) => {
    try {
        const { questions } = req.body; // Array of { text, type, options, correctAnswer, points }
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Add quizId reference to each question
        const questionsToInsert = questions.map(q => ({
            ...q,
            quizId
        }));

        const insertedQuestions = await Question.insertMany(questionsToInsert);

        res.status(201).json({
            success: true,
            message: "Questions added successfully!",
            data: insertedQuestions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET QUIZZES FOR COURSE
// ============================================
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ courseId: req.params.courseId }).sort("-createdAt");
        res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// START QUIZ ATTEMPT (Student only)
// Returns questions WITHOUT correct answers
// ============================================
exports.startQuizAttempt = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Check if student already completed this quiz
        const existingResult = await Result.findOne({ quizId: quiz._id, studentId: req.user.id });
        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: "You have already attempted this quiz.",
                data: existingResult
            });
        }

        // Fetch questions, select only non-sensitive details
        const questions = await Question.find({ quizId: quiz._id }).select("-correctAnswer");

        res.status(200).json({
            success: true,
            data: {
                quiz,
                questions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// SUBMIT QUIZ ATTEMPT (Student only)
// Auto-grades MCQ and True/False questions
// ============================================
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, value }
        const quizId = req.params.id;
        const studentId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Check duplicate attempt
        const duplicate = await Result.findOne({ quizId, studentId });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Quiz already submitted" });
        }

        // Fetch all questions for key matching
        const questions = await Question.find({ quizId });
        let totalMarks = 0;
        let score = 0;
        let gradedAnswers = [];
        let hasShortAnswer = false;

        questions.forEach(question => {
            totalMarks += question.points;
            const studentAnswerObj = answers.find(a => a.questionId.toString() === question._id.toString());
            const studentVal = studentAnswerObj ? studentAnswerObj.value : "";
            
            let questionScore = 0;
            if (question.type === "mcq" || question.type === "true_false" || question.type === "matching") {
                // Auto-grading: Case-insensitive match
                if (studentVal.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                    questionScore = question.points;
                }
            } else if (question.type === "short_answer" || question.type === "essay") {
                hasShortAnswer = true;
                // Leave grading to lecturer, default 0
                questionScore = 0;
            }

            score += questionScore;
            gradedAnswers.push({
                questionId: question._id,
                value: studentVal,
                score: questionScore
            });
        });

        // If quiz only contains objective questions, mark it graded: true
        const graded = !hasShortAnswer;

        const result = await Result.create({
            quizId,
            studentId,
            answers: gradedAnswers,
            score,
            totalMarks,
            graded
        });

        // Notify lecturer (optional)
        res.status(201).json({
            success: true,
            message: graded ? "Quiz submitted and auto-graded!" : "Quiz submitted successfully! Pending manual short answer grading.",
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// MANUAL GRADE RESULT (Lecturer/Admin only)
// ============================================
exports.gradeQuizResult = async (req, res) => {
    try {
        const { questionGrades } = req.body; // Array of { questionId, score }
        const result = await Result.findById(req.params.resultId).populate("quizId", "title");
        
        if (!result) {
            return res.status(404).json({ success: false, message: "Quiz result not found" });
        }

        let addedScore = 0;
        result.answers.forEach(ans => {
            const gradeObj = questionGrades.find(g => g.questionId.toString() === ans.questionId.toString());
            if (gradeObj) {
                // Update specific question score
                ans.score = gradeObj.score;
            }
            addedScore += ans.score;
        });

        result.score = addedScore;
        result.graded = true;
        await result.save();

        // Notify student
        await Notification.create({
            userId: result.studentId,
            title: "Quiz Graded 📝",
            message: `Your short answers for "${result.quizId.title}" have been graded. Final Score: ${addedScore}/${result.totalMarks}`,
            type: "grade"
        });

        res.status(200).json({
            success: true,
            message: "Quiz result graded successfully!",
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET RESULTS FOR A QUIZ
// ============================================
exports.getQuizResults = async (req, res) => {
    try {
        const { id } = req.params;
        let query = { quizId: id };

        if (req.user.role === "student") {
            query.studentId = req.user.id;
        }

        const results = await Result.find(query)
            .populate("studentId", "name email studentId")
            .populate({
                path: "answers.questionId",
                select: "text type options correctAnswer points"
            });

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
