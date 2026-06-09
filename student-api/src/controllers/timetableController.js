const Timetable = require("../models/Timetable");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Venue = require("../models/Venue");

// ============================================
// GET TIMETABLES (Filtered by student, lecturer, course, venue)
// ============================================
exports.getTimetables = async (req, res) => {
    try {
        const { studentId, lecturerId, courseId, venueId, semester } = req.query;
        let query = {};

        if (semester) query.semester = semester;

        // If filtering by student, get their enrolled courses
        if (studentId || req.user.role === "student") {
            const searchStudentId = studentId || req.user.id;
            const enrollments = await Enrollment.find({ studentId: searchStudentId, status: "approved" });
            const courseIds = enrollments.map(e => e.courseId);
            query.courseId = { $in: courseIds };
        } 
        // If filtering by lecturer
        else if (lecturerId || req.user.role === "lecturer") {
            query.lecturerId = lecturerId || req.user.id;
        } 
        // Direct course filter
        else if (courseId) {
            query.courseId = courseId;
        }

        if (venueId) {
            query.venueId = venueId;
        }

        const schedules = await Timetable.find(query)
            .populate("courseId", "code name semester credits")
            .populate("lecturerId", "name email")
            .populate("venueId", "name location type capacity")
            .sort("dayOfWeek startTime");

        res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// CREATE TIMETABLE SLOT (Admin & HOD only)
// ============================================
exports.createTimetableSlot = async (req, res) => {
    try {
        const { courseId, lecturerId, venueId, dayOfWeek, startTime, endTime, semester } = req.body;

        // Check venue conflicts: same venue, day, and overlapping time
        const conflict = await Timetable.findOne({
            venueId,
            dayOfWeek,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Venue collision: Another class is already scheduled in this venue at the same time"
            });
        }

        const newSlot = await Timetable.create({
            courseId,
            lecturerId,
            venueId,
            dayOfWeek,
            startTime,
            endTime,
            semester
        });

        res.status(201).json({ success: true, message: "Timetable slot added!", data: newSlot });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE TIMETABLE SLOT (Admin & HOD only)
// ============================================
exports.updateTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId, lecturerId, venueId, dayOfWeek, startTime, endTime, semester } = req.body;

        // Conflict checks if updating venue/times
        if (venueId && dayOfWeek && startTime && endTime) {
            const conflict = await Timetable.findOne({
                _id: { $ne: id },
                venueId,
                dayOfWeek,
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            });

            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: "Venue collision: Overlapping class exists at this venue"
                });
            }
        }

        const updatedSlot = await Timetable.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSlot) {
            return res.status(404).json({ success: false, message: "Timetable slot not found" });
        }

        res.status(200).json({ success: true, message: "Timetable slot updated!", data: updatedSlot });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE TIMETABLE SLOT (Admin & HOD only)
// ============================================
exports.deleteTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await Timetable.findById(id);
        if (!slot) {
            return res.status(404).json({ success: false, message: "Timetable slot not found" });
        }

        await Timetable.deleteOne({ _id: id });
        res.status(200).json({ success: true, message: "Timetable slot removed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
