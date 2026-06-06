const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema({
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ForumThread",
        required: true
    },
    content: {
        type: String,
        required: [true, "Comment content cannot be empty"]
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ForumComment",
        default: null // Null means a direct reply to the thread, otherwise a reply to another comment
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ForumComment", forumCommentSchema);
