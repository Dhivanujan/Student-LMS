const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ["pdf", "word", "powerpoint", "video", "link"],
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please add a course code"],
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, "Please add a course name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a course description"]
    },
    credits: {
        type: Number,
        required: [true, "Please add a credit value"],
        default: 3
    },
    semester: {
        type: String,
        required: [true, "Please add the semester (e.g. 'Fall 2026')"]
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: [true, "Course must belong to a department"]
    },
    lecturerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null // Can be unassigned initially
    },
    materials: [materialSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Course", courseSchema);
