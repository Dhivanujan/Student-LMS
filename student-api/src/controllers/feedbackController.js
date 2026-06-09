const Feedback = require("../models/Feedback");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ============================================
// SUBMIT FEEDBACK (Student only)
// ============================================
exports.submitFeedback = async (req, res) => {
    try {
        const { type, courseId, toUser, rating, comments } = req.body;
        const fromUser = req.user.id;

        // Validation for course feedback: student must be enrolled
        if (type === "course" || type === "lecturer") {
            if (!courseId) {
                return res.status(400).json({ success: false, message: "Course ID is required" });
            }

            const enrolled = await Enrollment.findOne({ studentId: fromUser, courseId, status: "approved" });
            if (!enrolled) {
                return res.status(403).json({
                    success: false,
                    message: "You can only submit feedback for courses you are active in."
                });
            }
        }

        const feedback = await Feedback.create({
            type,
            fromUser,
            toUser: type === "lecturer" ? toUser : undefined,
            courseId: (type === "course" || type === "lecturer") ? courseId : undefined,
            rating,
            comments
        });

        res.status(201).json({ success: true, message: "Feedback submitted successfully! Thank you.", data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET FEEDBACKS (Admin / HOD / Lecturer)
// ============================================
exports.getFeedbacks = async (req, res) => {
    try {
        const { courseId, toUser, type } = req.query;
        let query = {};

        if (type) query.type = type;
        if (courseId) query.courseId = courseId;
        if (toUser) query.toUser = toUser;

        // Security role checks: lecturers can only see their own feedback
        if (req.user.role === "lecturer") {
            query.$or = [
                { toUser: req.user.id },
                { courseId: { $in: await Course.find({ lecturerId: req.user.id }).map(c => c._id) } }
            ];
        }

        const feedbacks = await Feedback.find(query)
            .populate("fromUser", "name email registrationNumber department")
            .populate("toUser", "name email")
            .populate("courseId", "code name")
            .sort("-createdAt");

        res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
