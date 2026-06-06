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
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
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
