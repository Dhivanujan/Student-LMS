const Event = require("../models/Event");
const Venue = require("../models/Venue");

// ============================================
// GET ALL VENUES
// ============================================
exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.find().sort("name");
        res.status(200).json({ success: true, count: venues.length, data: venues });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// CREATE VENUE (Admin only)
// ============================================
exports.createVenue = async (req, res) => {
    try {
        const { name, capacity, type, location } = req.body;
        const venue = await Venue.create({ name, capacity, type, location });
        res.status(201).json({ success: true, message: "Venue created successfully!", data: venue });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET ALL EVENTS
// ============================================
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate("venueId", "name location capacity type")
            .populate("organizerId", "name email role")
            .populate("participants", "name email registrationNumber")
            .sort("date");

        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// CREATE EVENT (Lecturer / HOD / Admin)
// ============================================
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, venueId, type, maxParticipants } = req.body;

        // Check if venue exists
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ success: false, message: "Venue not found" });
        }

        const event = await Event.create({
            title,
            description,
            date,
            venueId,
            organizerId: req.user.id,
            type,
            maxParticipants
        });

        res.status(201).json({ success: true, message: "Event scheduled successfully!", data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// REGISTER PARTICIPANT (Student / User)
// ============================================
exports.registerParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Check if user already registered
        if (event.participants.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: "You are already registered for this event" });
        }

        // Check if capacity full
        if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ success: false, message: "Registration is full for this event" });
        }

        event.participants.push(req.user.id);
        await event.save();

        res.status(200).json({ success: true, message: "Registered for event successfully!", data: event });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE EVENT
// ============================================
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Only organizer or Admin can delete
        if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this event" });
        }

        await Event.deleteOne({ _id: id });
        res.status(200).json({ success: true, message: "Event cancelled successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
