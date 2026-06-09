const mongoose = require("mongoose");

const portfolioItemSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please add a title for the portfolio item"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["audio", "video", "image", "document"],
        required: [true, "Please specify the media type"]
    },
    fileUrl: {
        type: String,
        required: [true, "Please provide the file URL"]
    },
    category: {
        type: String,
        default: "General"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("PortfolioItem", portfolioItemSchema);
