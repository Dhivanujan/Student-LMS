const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    academicYear: {
        type: String,
        default: ""
    },
    semester: {
        type: Number,
        default: 1
    },
    gpa: {
        type: Number,
        default: 0.0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Student", studentSchema);
