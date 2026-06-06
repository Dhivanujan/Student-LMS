const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please add a quiz title"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    durationMinutes: {
        type: Number,
        required: [true, "Please set a duration in minutes"],
        default: 30
    },
    dueDate: {
        type: Date,
        required: [true, "Please set a due date"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Quiz", quizSchema);
