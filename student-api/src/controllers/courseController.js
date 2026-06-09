const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const AuditLog = require("../models/AuditLog");
const CourseMaterial = require("../models/CourseMaterial");

// Helper to log audit actions
const logAudit = async (action, details, performerId, ip) => {
    try {
        await AuditLog.create({ action, details, performerId, ipAddress: ip || "" });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

// ============================================
// GET ALL COURSES (With filters)
// ============================================
exports.getCourses = async (req, res) => {
    try {
        const { departmentId, semester, search, lecturerId } = req.query;
        let query = {};

        if (departmentId) query.departmentId = departmentId;
        if (semester) query.semester = semester;
        if (lecturerId) query.lecturerId = lecturerId;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }

        const courses = await Course.find(query)
            .populate("departmentId", "name code")
            .populate("lecturerId", "name email specialization");

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

// ============================================
// GET SINGLE COURSE DETAILS
// ============================================
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("departmentId", "name code")
            .populate("lecturerId", "name email specialization");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Fetch students enrolled (approved status)
        const enrollments = await Enrollment.find({ courseId: course._id, status: "approved" })
            .populate("studentId", "name email studentId");
        
        const enrolledStudents = enrollments.map(e => e.studentId);

        // Fetch course materials from separate collection
        const materials = await CourseMaterial.find({ courseId: course._id })
            .populate("uploadedBy", "name");

        const courseObj = course.toObject();
        courseObj.materials = materials;

        res.status(200).json({
            success: true,
            data: {
                course: courseObj,
                enrolledStudents
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch course details",
            error: error.message
        });
    }
};

// ============================================
// CREATE COURSE (Admin only)
// ============================================
exports.createCourse = async (req, res) => {
    try {
        const { code, name, description, credits, semester, departmentId, lecturerId } = req.body;

        const codeExists = await Course.findOne({ code: code.toUpperCase() });
        if (codeExists) {
            return res.status(400).json({
                success: false,
                message: "Course with this code already exists"
            });
        }

        const course = await Course.create({
            code: code.toUpperCase(),
            name,
            description,
            credits,
            semester,
            departmentId,
            lecturerId: lecturerId || null
        });

        await logAudit("COURSE_CREATE", `Created course: ${course.code} - ${course.name}`, req.user._id, req.ip);

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

// ============================================
// UPDATE COURSE (Admin only)
// ============================================
exports.updateCourse = async (req, res) => {
    try {
        const { code, name, description, credits, semester, departmentId, lecturerId } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (code) course.code = code.toUpperCase();
        if (name) course.name = name;
        if (description) course.description = description;
        if (credits) course.credits = credits;
        if (semester) course.semester = semester;
        if (departmentId) course.departmentId = departmentId;
        if (lecturerId !== undefined) course.lecturerId = lecturerId || null;

        await course.save();

        await logAudit("COURSE_UPDATE", `Updated course: ${course.code}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "Course updated successfully!",
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update course",
            error: error.message
        });
    }
};

// ============================================
// ASSIGN LECTURER TO COURSE (Admin only)
// ============================================
exports.assignLecturer = async (req, res) => {
    try {
        const { lecturerId } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (lecturerId) {
            const lecturer = await User.findOne({ _id: lecturerId, role: "lecturer" });
            if (!lecturer) {
                return res.status(400).json({
                    success: false,
                    message: "Selected user is not a valid lecturer"
                });
            }
        }

        course.lecturerId = lecturerId || null;
        await course.save();

        await logAudit("LECTURER_ASSIGN", `Assigned lecturer to course: ${course.code}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: lecturerId ? "Lecturer assigned successfully!" : "Lecturer unassigned successfully!",
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to assign lecturer",
            error: error.message
        });
    }
};

// ============================================
// DELETE COURSE (Admin only)
// ============================================
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Remove enrollments, assignments, quizzes, results (can cascade later or delete course)
        await Course.findByIdAndDelete(req.params.id);
        await Enrollment.deleteMany({ courseId: req.params.id });

        await logAudit("COURSE_DELETE", `Deleted course: ${course.code}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message
        });
    }
};

// ============================================
// UPLOAD LEARNING MATERIAL (Lecturer only)
// ============================================
exports.uploadMaterial = async (req, res) => {
    try {
        const { title, fileType, externalUrl } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Authorize: user must be the assigned lecturer or admin
        if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to upload materials for this course"
            });
        }

        let fileUrl = "";
        if (fileType === "link") {
            fileUrl = externalUrl;
        } else {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a material file"
                });
            }
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const newMaterial = await CourseMaterial.create({
            courseId: course._id,
            title,
            fileType,
            fileUrl,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Learning material uploaded successfully!",
            data: newMaterial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to upload material",
            error: error.message
        });
    }
};

// ============================================
// DELETE LEARNING MATERIAL (Lecturer only)
// ============================================
exports.deleteMaterial = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Authorize: user must be the assigned lecturer or admin
        if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete materials for this course"
            });
        }

        await CourseMaterial.findByIdAndDelete(req.params.materialId);

        res.status(200).json({
            success: true,
            message: "Material deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete material",
            error: error.message
        });
    }
};
