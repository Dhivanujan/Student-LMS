const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const Enrollment = require("../models/Enrollment");

// ============================================
// CREATE ASSIGNMENT (Lecturer only)
// ============================================
exports.createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, dueDate, maxMarks } = req.body;

        const course = await Course.findById(courseId);
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
                message: "Not authorized to create assignments for this course"
            });
        }

        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const assignment = await Assignment.create({
            courseId,
            title,
            description,
            dueDate,
            maxMarks,
            fileUrl
        });

        // Notify enrolled students
        const enrollments = await Enrollment.find({ courseId, status: "approved" });
        const notifications = enrollments.map(e => ({
            userId: e.studentId,
            title: `New Assignment: ${title} 📝`,
            message: `A new assignment has been posted for "${course.code}". Due Date: ${new Date(dueDate).toLocaleDateString()}`,
            type: "assignment"
        }));
        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: "Assignment created successfully!",
            data: assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create assignment",
            error: error.message
        });
    }
};

// ============================================
// GET ASSIGNMENTS FOR A COURSE
// ============================================
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ courseId: req.params.courseId }).sort("-createdAt");
        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch assignments",
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE ASSIGNMENT DETAILS (Including Submissions)
// ============================================
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate("courseId", "name code lecturerId");
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        let resultData = { assignment };

        if (req.user.role === "student") {
            // Include student's own submission if any
            const submission = await Submission.findOne({
                assignmentId: assignment._id,
                studentId: req.user.id
            });
            resultData.mySubmission = submission;
        } else {
            // Lecturers/Admins: Fetch all submissions
            const submissions = await Submission.find({ assignmentId: assignment._id })
                .populate("studentId", "name email studentId");
            resultData.submissions = submissions;
        }

        res.status(200).json({
            success: true,
            data: resultData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch assignment details",
            error: error.message
        });
    }
};

// ============================================
// STUDENT SUBMIT WORK (Student only)
// ============================================
exports.submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        // Verify enrollment
        const isEnrolled = await Enrollment.findOne({
            studentId: req.user.id,
            courseId: assignment.courseId,
            status: "approved"
        });

        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your submission file"
            });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const isLate = new Date() > new Date(assignment.dueDate);
        const status = isLate ? "late" : "submitted";

        // Check if there is an existing submission (allow re-submission by overwriting)
        let submission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user.id
        });

        if (submission) {
            submission.fileUrl = fileUrl;
            submission.submittedAt = Date.now();
            submission.status = status;
            submission.comments = req.body.comments || "";
            await submission.save();
        } else {
            submission = await Submission.create({
                assignmentId: assignment._id,
                studentId: req.user.id,
                fileUrl,
                comments: req.body.comments || "",
                status
            });
        }

        res.status(200).json({
            success: true,
            message: isLate ? "Submission uploaded successfully (LATE DETECTED)" : "Submission uploaded successfully!",
            data: submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to submit assignment",
            error: error.message
        });
    }
};

// ============================================
// LECTURER GRADE SUBMISSION (Lecturer/Admin only)
// ============================================
exports.gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findById(req.params.submissionId)
            .populate("assignmentId", "title courseId");
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        const course = await Course.findById(submission.assignmentId.courseId);
        // Authorize
        if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to grade submissions for this course"
            });
        }

        submission.grade = grade;
        submission.feedback = feedback || "";
        submission.status = "graded";
        await submission.save();

        // Notify student
        await Notification.create({
            userId: submission.studentId,
            title: "Assignment Graded 🌟",
            message: `Your submission for "${submission.assignmentId.title}" has been graded. Score: ${grade}`,
            type: "grade"
        });

        res.status(200).json({
            success: true,
            message: "Submission graded successfully!",
            data: submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to grade submission",
            error: error.message
        });
    }
};
