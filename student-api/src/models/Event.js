const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add an event title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add an event description"]
    },
    date: {
        type: Date,
        required: [true, "Please add a date and time for the event"]
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["performance", "exhibition", "workshop", "seminar", "other"],
        required: [true, "Please specify an event type"]
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    maxParticipants: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Event", eventSchema);
