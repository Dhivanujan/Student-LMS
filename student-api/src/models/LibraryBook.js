const mongoose = require("mongoose");

const libraryBookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a book/material title"],
        trim: true
    },
    author: {
        type: String,
        required: [true, "Please add an author"],
        trim: true
    },
    category: {
        type: String,
        enum: ["Music", "Dance", "Drama & Theatre", "Visual & Technological Arts", "General Academic", "Past Papers", "Research Materials"],
        required: [true, "Please specify a category"]
    },
    type: {
        type: String,
        enum: ["book", "past_paper", "research_paper"],
        required: [true, "Please specify a material type"]
    },
    fileUrl: {
        type: String,
        default: ""
    },
    isbn: {
        type: String,
        default: ""
    },
    publishedYear: {
        type: Number
    },
    description: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("LibraryBook", libraryBookSchema);
