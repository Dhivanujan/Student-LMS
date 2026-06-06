const mongoose = require("mongoose");

const forumThreadSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please add a topic title"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Please add thread content"]
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ForumThread", forumThreadSchema);
