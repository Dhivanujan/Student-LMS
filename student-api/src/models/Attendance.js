const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        required: true
    }
});

const attendanceSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    records: [attendanceRecordSchema]
});

// Compound index to avoid marking duplicate attendance sheets for the same course on the same date (ignoring hours/minutes)
attendanceSchema.index({ courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
