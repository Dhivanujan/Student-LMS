const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

// ============================================
// ADMIN DASHBOARD METRICS
// ============================================
exports.getAdminMetrics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalLecturers = await User.countDocuments({ role: "lecturer" });
        const totalCourses = await Course.countDocuments();
        
        // Active requests count
        const pendingEnrollments = await Enrollment.countDocuments({ status: "pending" });

        // Simple activity counts for chart
        const recentAudits = await Enrollment.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
            { $limit: 7 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalLecturers,
                totalCourses,
                pendingEnrollments,
                activityChart: recentAudits.reverse()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// LECTURER DASHBOARD METRICS
// ============================================
exports.getLecturerMetrics = async (req, res) => {
    try {
        const lecturerId = req.user.id;

        // Fetch courses taught
        const courses = await Course.find({ lecturerId });
        const courseIds = courses.map(c => c._id);

        const totalCourses = courses.length;

        // Fetch pending submissions to grade
        const assignments = await Assignment.find({ courseId: { $in: courseIds } });
        const assignmentIds = assignments.map(a => a._id);

        const pendingGrading = await Submission.countDocuments({
            assignmentId: { $in: assignmentIds },
            status: "submitted"
        });

        // Simple stats
        const totalStudentsCount = await Enrollment.countDocuments({
            courseId: { $in: courseIds },
            status: "approved"
        });

        res.status(200).json({
            success: true,
            data: {
                totalCourses,
                pendingGrading,
                totalStudents: totalStudentsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// STUDENT DASHBOARD METRICS
// ============================================
exports.getStudentMetrics = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Count enrolled courses
        const enrolledCount = await Enrollment.countDocuments({ studentId, status: "approved" });

        // Fetch grading progress
        const submissions = await Submission.find({ studentId });
        const gradedCount = submissions.filter(s => s.status === "graded").length;
        const totalGradeSum = submissions.filter(s => s.status === "graded").reduce((acc, curr) => acc + curr.grade, 0);
        
        let gpa = 0.0;
        if (gradedCount > 0) {
            // Simple percentage to GPA 4.0 mapping
            const avgPercentage = totalGradeSum / gradedCount;
            gpa = ((avgPercentage / 100) * 4.0).toFixed(2);
        }

        // Upcoming assignments
        const enrollments = await Enrollment.find({ studentId, status: "approved" });
        const courseIds = enrollments.map(e => e.courseId);
        
        const upcomingAssignments = await Assignment.find({
            courseId: { $in: courseIds },
            dueDate: { $gte: new Date() }
        }).sort("dueDate").limit(5);

        res.status(200).json({
            success: true,
            data: {
                enrolledCourses: enrolledCount,
                gpa,
                upcomingAssignments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT REPORTS MOCK
// Returns formatted mock CSV/Excel structure or raw text data
// ============================================
exports.exportReport = async (req, res) => {
    try {
        const { type } = req.query; // 'grades', 'attendance', 'users'
        let csvContent = "";

        if (type === "grades") {
            const submissions = await Submission.find()
                .populate("studentId", "name email studentId")
                .populate({ path: "assignmentId", populate: { path: "courseId", select: "name code" } });

            csvContent = "Student ID,Student Name,Course Code,Assignment,Grade,Status\n";
            submissions.forEach(sub => {
                csvContent += `"${sub.studentId?.studentId || "N/A"}","${sub.studentId?.name || "N/A"}","${sub.assignmentId?.courseId?.code || "N/A"}","${sub.assignmentId?.title || "N/A"}",${sub.grade !== null ? sub.grade : "Ungraded"},"${sub.status}"\n`;
            });
        } else {
            const users = await User.find().populate("departmentId", "name");
            csvContent = "ID,Name,Email,Role,Department\n";
            users.forEach(u => {
                const idVal = u.role === "student" ? u.studentId : (u.role === "lecturer" ? u.lecturerId : "N/A");
                csvContent += `"${idVal}","${u.name}","${u.email}","${u.role}","${u.departmentId?.name || "N/A"}"\n`;
            });
        }

        res.header("Content-Type", "text/csv");
        res.attachment(`${type || "report"}-export.csv`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
