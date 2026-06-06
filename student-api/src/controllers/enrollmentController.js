const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

// Helper to log audit actions
const logAudit = async (action, details, performerId, ip) => {
    try {
        await AuditLog.create({ action, details, performerId, ipAddress: ip || "" });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

// ============================================
// STUDENT REQUEST ENROLLMENT
// ============================================
exports.requestEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check for existing request
        const existingRequest = await Enrollment.findOne({
            studentId,
            courseId,
            semester: course.semester
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: `You already have a ${existingRequest.status} enrollment request for this course in this semester`
            });
        }

        // Create enrollment request
        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            semester: course.semester,
            status: "pending"
        });

        await logAudit("ENROLLMENT_REQUEST", `Student requested enrollment in ${course.code}`, req.user._id, req.ip);

        // Notify admins (optional) or log
        res.status(201).json({
            success: true,
            message: "Enrollment request submitted successfully and is pending approval!",
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to request enrollment",
            error: error.message
        });
    }
};

// ============================================
// GET ALL ENROLLMENTS (Admin only / Lecturer only filter)
// ============================================
exports.getEnrollments = async (req, res) => {
    try {
        const { status, courseId } = req.query;
        let query = {};

        if (status) query.status = status;
        if (courseId) query.courseId = courseId;

        const enrollments = await Enrollment.find(query)
            .populate("studentId", "name email studentId")
            .populate("courseId", "name code semester credits");

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
            error: error.message
        });
    }
};

// ============================================
// ADMIN APPROVE ENROLLMENT
// ============================================
exports.approveEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate("courseId", "name code");
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment record not found"
            });
        }

        enrollment.status = "approved";
        await enrollment.save();

        await logAudit("ENROLLMENT_APPROVE", `Approved enrollment for student: ${enrollment.studentId} in course: ${enrollment.courseId?.code}`, req.user._id, req.ip);

        // Send notification to student
        await Notification.create({
            userId: enrollment.studentId,
            title: "Enrollment Approved 🎉",
            message: `Your request to enroll in "${enrollment.courseId.code} - ${enrollment.courseId.name}" has been approved!`,
            type: "enrollment"
        });

        res.status(200).json({
            success: true,
            message: "Enrollment request approved successfully!",
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to approve enrollment",
            error: error.message
        });
    }
};

// ============================================
// ADMIN REJECT ENROLLMENT
// ============================================
exports.rejectEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate("courseId", "name code");
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment record not found"
            });
        }

        enrollment.status = "rejected";
        await enrollment.save();

        await logAudit("ENROLLMENT_REJECT", `Rejected enrollment for student: ${enrollment.studentId} in course: ${enrollment.courseId?.code}`, req.user._id, req.ip);

        // Send notification to student
        await Notification.create({
            userId: enrollment.studentId,
            title: "Enrollment Rejected",
            message: `Your request to enroll in "${enrollment.courseId.code} - ${enrollment.courseId.name}" has been rejected.`,
            type: "enrollment"
        });

        res.status(200).json({
            success: true,
            message: "Enrollment request rejected successfully!",
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reject enrollment",
            error: error.message
        });
    }
};

// ============================================
// GET ENROLLED COURSES FOR ME (Student only)
// ============================================
exports.getMyEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            studentId: req.user.id,
            status: "approved"
        }).populate({
            path: "courseId",
            populate: {
                path: "lecturerId",
                select: "name email specialization"
            }
        });

        const courses = enrollments.map(e => e.courseId).filter(c => c !== null);

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch your courses",
            error: error.message
        });
    }
};
