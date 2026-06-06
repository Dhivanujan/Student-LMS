// ============================================
// COURSE CONTROLLER - Handles Course requests
// ============================================

const Course = require("../models/Course");
const Student = require("../models/Student");
const courseService = require("../services/courseService");

/**
 * GET ALL COURSES
 * Route: GET /api/courses
 * Access: Public (or authenticated users)
 */
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("enrolledStudents", "name email");

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message
        });
    }
};

/**
 * CREATE A COURSE
 * Route: POST /api/courses
 * Access: Private (Admin only)
 */
exports.createCourse = async (req, res) => {
    try {
        const { title, description, instructor, duration, capacity } = req.body;

        // Check if course already exists
        const courseExists = await Course.findOne({ title });
        if (courseExists) {
            return res.status(400).json({
                success: false,
                message: "Course with this title already exists"
            });
        }

        const course = await Course.create({
            title,
            description,
            instructor,
            duration,
            capacity
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully!",
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        });
    }
};

/**
 * DELETE A COURSE
 * Route: DELETE /api/courses/:id
 * Access: Private (Admin only)
 */
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // 1. Maintain referential integrity: pull course reference from all students
        await Student.updateMany(
            { enrolledCourses: req.params.id },
            { $pull: { enrolledCourses: req.params.id } }
        );

        // 2. Delete the course
        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message
        });
    }
};

/**
 * ENROLL IN A COURSE
 * Route: POST /api/courses/:id/enroll
 * Access: Private (Student only)
 */
exports.enrollInCourse = async (req, res) => {
    try {
        // Enforce role check (only student role can enroll)
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students are allowed to enroll in courses"
            });
        }

        const enrollmentResult = await courseService.enrollStudentInCourse(
            req.user.id,
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Enrolled in course successfully!",
            data: enrollmentResult
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Enrollment failed",
            error: error.message
        });
    }
};

/**
 * UNENROLL FROM A COURSE
 * Route: POST /api/courses/:id/unenroll
 * Access: Private (Student only)
 */
exports.unenrollFromCourse = async (req, res) => {
    try {
        // Enforce role check (only student role can unenroll)
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students are allowed to unenroll from courses"
            });
        }

        const enrollmentResult = await courseService.unenrollStudentFromCourse(
            req.user.id,
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully!",
            data: enrollmentResult
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Unenrollment failed",
            error: error.message
        });
    }
};
