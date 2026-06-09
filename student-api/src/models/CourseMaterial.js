const mongoose = require("mongoose");

const courseMaterialSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: [true, "Please add a title for the material"]
    },
    fileUrl: {
        type: String,
        required: [true, "Please add a file URL"]
    },
    fileType: {
        type: String,
        enum: ["pdf", "word", "powerpoint", "video", "audio", "image", "link"],
        required: [true, "Please specify the file type"]
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("CourseMaterial", courseMaterialSchema);
