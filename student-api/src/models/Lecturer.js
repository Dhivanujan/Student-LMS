const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    specialization: {
        type: String,
        default: ""
    },
    qualifications: [
        {
            type: String
        }
    ],
    biography: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Lecturer", lecturerSchema);
