const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a venue name"],
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, "Please specify room capacity"],
        default: 30
    },
    type: {
        type: String,
        enum: ["theatre", "hall", "studio", "classroom", "gallery"],
        required: [true, "Please specify a venue type"]
    },
    location: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Venue", venueSchema);
