const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["course", "lecturer", "student_collection"],
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Please provide a rating between 1 and 5"]
    },
    comments: {
        type: String,
        required: [true, "Please add comment feedback"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
