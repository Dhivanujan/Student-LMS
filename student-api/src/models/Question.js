const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    text: {
        type: String,
        required: [true, "Please add the question text"],
        trim: true
    },
    type: {
        type: String,
        enum: ["mcq", "true_false", "short_answer"],
        required: [true, "Please specify the question type"]
    },
    options: [
        {
            type: String // Required for MCQ, empty for true_false / short_answer
        }
    ],
    correctAnswer: {
        type: String, // String representation: index for MCQ (e.g. "0"), "true"/"false" for true_false, keyword/rubric for short_answer
        required: [true, "Please specify the correct answer or grading key"]
    },
    points: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model("Question", questionSchema);
