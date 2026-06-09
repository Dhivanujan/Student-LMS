const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    name: {
        type: String,
        required: [true, "Please add an exam name"],
        trim: true
    },
    date: {
        type: Date,
        required: [true, "Please add a date and time for the exam"]
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue"
    },
    maxMarks: {
        type: Number,
        required: [true, "Please specify maximum marks"],
        default: 100
    },
    status: {
        type: String,
        enum: ["scheduled", "completed", "published"],
        default: "scheduled"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Exam", examSchema);
