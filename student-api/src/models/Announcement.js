const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a title"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Please add announcement content"]
    },
    scope: {
        type: String,
        enum: ["university", "department", "course"],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // Can reference Course or Department based on scope
        default: null
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    priority: {
        type: String,
        enum: ["normal", "high"],
        default: "normal"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Announcement", announcementSchema);
