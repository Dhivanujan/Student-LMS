const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    value: {
        type: String, // Student's response
        default: ""
    },
    score: {
        type: Number,
        default: 0 // Graded points
    }
});

const resultSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: false // Optional for exams
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: false // Optional for quizzes
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0 // Marks obtained
    },
    totalMarks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        default: "" // e.g. "A+", "A", "B", "C", "F"
    },
    gradePoints: {
        type: Number,
        default: 0.0 // e.g. 4.00, 3.00, etc. for GPA
    },
    graded: {
        type: Boolean,
        default: false // Set to true after automatic or manual scoring is completed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);
