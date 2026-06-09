const express = require("express");
const router = express.Router();
const {
    getVenues,
    createVenue,
    getEvents,
    createEvent,
    registerParticipant,
    deleteEvent
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/venues")
    .get(getVenues)
    .post(authorize("admin", "hod"), createVenue);

router.route("/")
    .get(getEvents)
    .post(authorize("admin", "hod", "lecturer"), createEvent);

router.route("/:id/register")
    .post(registerParticipant);

router.route("/:id")
    .delete(authorize("admin", "hod", "lecturer"), deleteEvent);

module.exports = router;
