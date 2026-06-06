// ============================================
// COURSE MODEL - Database Schema Definition
// ============================================

const mongoose = require("mongoose");

/**
 * COURSE SCHEMA
 * Defines the structure of a course document in MongoDB
 */
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a course title"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a description"]
    },
    instructor: {
        type: String,
        required: [true, "Please add an instructor name"]
    },
    duration: {
        type: String,
        required: [true, "Please add the course duration (e.g., '8 weeks')"]
    },
    capacity: {
        type: Number,
        required: [true, "Please add the course student capacity"],
        default: 30
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Course", courseSchema);
