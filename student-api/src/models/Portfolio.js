const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ""
    },
    skills: [
        {
            type: String
        }
    ],
    category: {
        type: String,
        enum: ["Music", "Dance", "Drama & Theatre", "Visual & Technological Arts"],
        required: [true, "Please specify a portfolio category"]
    },
    featuredImage: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
