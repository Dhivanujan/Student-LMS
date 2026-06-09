const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    lecturerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: [true, "Please specify a day of the week"]
    },
    startTime: {
        type: String, // format: "HH:MM" (24-hour)
        required: [true, "Please specify a start time"]
    },
    endTime: {
        type: String, // format: "HH:MM" (24-hour)
        required: [true, "Please specify an end time"]
    },
    semester: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Timetable", timetableSchema);
