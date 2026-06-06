const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fileUrl: {
        type: String,
        required: [true, "Please upload a submission file"]
    },
    comments: {
        type: String,
        default: ""
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: Number,
        default: null // Null means not graded yet
    },
    feedback: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["submitted", "graded", "late"],
        default: "submitted"
    }
});

// Ensure a student can only make one submission per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
