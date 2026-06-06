const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    semester: {
        type: String,
        required: true
    },
    finalGrade: {
        type: String,
        default: "" // e.g. "A", "B+", etc.
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate enrollment records for the same student, course and semester
enrollmentSchema.index({ studentId: 1, courseId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
