const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please add a title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a description"]
    },
    dueDate: {
        type: Date,
        required: [true, "Please set a due date"]
    },
    maxMarks: {
        type: Number,
        required: [true, "Please set maximum marks"],
        default: 100
    },
    fileUrl: {
        type: String,
        default: "" // Optional guideline file uploaded by lecturer
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
