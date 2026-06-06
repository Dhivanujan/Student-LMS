// ============================================
// STUDENT MODEL - Database Schema Definition
// ============================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * STUDENT SCHEMA
 * Defines the structure of a student document in MongoDB
 */
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false // Do not return password by default in queries
    },
    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash password before saving
studentSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
studentSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Export the model
module.exports = mongoose.model("Student", studentSchema);