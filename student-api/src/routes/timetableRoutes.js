const express = require("express");
const router = express.Router();
const {
    getTimetables,
    createTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot
} = require("../controllers/timetableController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(getTimetables)
    .post(authorize("admin", "hod"), createTimetableSlot);

router.route("/:id")
    .put(authorize("admin", "hod"), updateTimetableSlot)
    .delete(authorize("admin", "hod"), deleteTimetableSlot);

module.exports = router;
