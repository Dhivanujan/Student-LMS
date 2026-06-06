const Announcement = require("../models/Announcement");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ============================================
// CREATE ANNOUNCEMENT (Admin / Lecturer only)
// ============================================
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, scope, targetId, priority } = req.body;
        const authorId = req.user.id;

        // Validation for scoped targets
        if (scope === "course" && !targetId) {
            return res.status(400).json({ success: false, message: "Course ID is required for course scope" });
        }
        if (scope === "department" && !targetId) {
            return res.status(400).json({ success: false, message: "Department ID is required for department scope" });
        }

        // Authorization checks
        if (scope === "course") {
            const course = await Course.findById(targetId);
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: "Not authorized to announce in this course" });
            }
        } else if (scope === "department" || scope === "university") {
            if (req.user.role !== "admin") {
                return res.status(403).json({ success: false, message: "Only administrators can make department or university announcements" });
            }
        }

        const announcement = await Announcement.create({
            title,
            content,
            scope,
            targetId: targetId || null,
            authorId,
            priority: priority || "normal"
        });

        const populated = await Announcement.findById(announcement._id)
            .populate("authorId", "name role");

        res.status(201).json({
            success: true,
            message: "Announcement posted successfully!",
            data: populated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET ANNOUNCEMENT FEED (Student / Lecturer feed aggregator)
// Retrieves relevant announcements (university, user's department, and enrolled/taught courses)
// ============================================
exports.getAnnouncementFeed = async (req, res) => {
    try {
        let courseIds = [];
        let departmentId = req.user.departmentId;

        if (req.user.role === "student") {
            // Find enrolled courses
            const enrolls = await Enrollment.find({ studentId: req.user.id, status: "approved" });
            courseIds = enrolls.map(e => e.courseId);
        } else if (req.user.role === "lecturer") {
            // Find assigned courses
            const courses = await Course.find({ lecturerId: req.user.id });
            courseIds = courses.map(c => c._id);
        }

        // Build query OR clauses
        let orConditions = [{ scope: "university" }];

        if (departmentId) {
            orConditions.push({ scope: "department", targetId: departmentId });
        }

        if (courseIds.length > 0) {
            orConditions.push({ scope: "course", targetId: { $in: courseIds } });
        }

        const feed = await Announcement.find({ $or: orConditions })
            .populate("authorId", "name role profilePicture")
            .populate("targetId", "name code") // Populate either Course or Department if matched
            .sort("-createdAt");

        res.status(200).json({
            success: true,
            count: feed.length,
            data: feed
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET COURSE-LEVEL ANNOUNCEMENTS
// ============================================
exports.getCourseAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            scope: "course",
            targetId: req.params.courseId
        })
            .populate("authorId", "name role")
            .sort("-createdAt");

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE ANNOUNCEMENT
// ============================================
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        // Only author or admin can delete
        if (req.user.role !== "admin" && announcement.authorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
