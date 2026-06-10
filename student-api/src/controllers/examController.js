const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Student = require("../models/Student");
const AuditLog = require("../models/AuditLog");

// Helper to log audit actions
const logAudit = async (action, details, performerId, ip) => {
    try {
        await AuditLog.create({ action, details, performerId, ipAddress: ip || "" });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

// Sri Lankan State University grading system helper
const calculateGradeAndPoints = (score, maxMarks) => {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 85) return { grade: "A+", gradePoints: 4.00 };
    if (percentage >= 80) return { grade: "A", gradePoints: 4.00 };
    if (percentage >= 75) return { grade: "A-", gradePoints: 3.70 };
    if (percentage >= 70) return { grade: "B+", gradePoints: 3.30 };
    if (percentage >= 65) return { grade: "B", gradePoints: 3.00 };
    if (percentage >= 60) return { grade: "B-", gradePoints: 2.70 };
    if (percentage >= 55) return { grade: "C+", gradePoints: 2.30 };
    if (percentage >= 50) return { grade: "C", gradePoints: 2.00 };
    if (percentage >= 45) return { grade: "C-", gradePoints: 1.70 };
    if (percentage >= 40) return { grade: "D+", gradePoints: 1.30 };
    if (percentage >= 35) return { grade: "D", gradePoints: 1.00 };
    return { grade: "F", gradePoints: 0.00 };
};

// ============================================
// CREATE EXAM (HOD & Exam Officer only)
// ============================================
exports.createExam = async (req, res) => {
    try {
        const { courseId, name, date, venueId, maxMarks } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const exam = await Exam.create({
            courseId,
            name,
            date,
            venueId,
            maxMarks,
            createdBy: req.user.id
        });

        await logAudit("CREATE_EXAM", `Scheduled exam ${name} for course ${course.code}`, req.user.id, req.ip);

        res.status(201).json({ success: true, message: "Exam scheduled successfully!", data: exam });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET ALL EXAMS
// ============================================
exports.getExams = async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};
        if (courseId) query.courseId = courseId;

        const exams = await Exam.find(query)
            .populate("courseId", "code name")
            .populate("venueId", "name location")
            .sort("date");

        res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// ENTER MARKS (Exam Officer, HOD, or Assigned Lecturer)
// ============================================
exports.enterMarks = async (req, res) => {
    try {
        const { examId } = req.params;
        const { studentMarks } = req.body; // Array of { studentId, score }

        const exam = await Exam.findById(examId).populate("courseId");
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        // Authorization check: Admin or the assigned lecturer of the course
        const isLecturer = exam.courseId.lecturerId?.toString() === req.user.id;
        const isAdmin = ["admin"].includes(req.user.role);

        if (!isLecturer && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized to enter marks for this exam" });
        }

        // Upsert results
        const results = [];
        for (const entry of studentMarks) {
            const { studentId, score } = entry;
            const { grade, gradePoints } = calculateGradeAndPoints(score, exam.maxMarks);

            const result = await Result.findOneAndUpdate(
                { examId, studentId },
                {
                    examId,
                    studentId,
                    score,
                    totalMarks: exam.maxMarks,
                    grade,
                    gradePoints,
                    graded: true
                },
                { upsert: true, new: true }
            );

            // Update course grade in Enrollment
            await Enrollment.findOneAndUpdate(
                { studentId, courseId: exam.courseId._id },
                { grade }
            );

            results.push(result);
        }

        // Mark exam as completed (marks entered)
        exam.status = "completed";
        await exam.save();

        await logAudit("ENTER_EXAM_MARKS", `Entered grades for exam: ${exam.name}`, req.user.id, req.ip);

        res.status(200).json({ success: true, message: "Marks saved successfully!", count: results.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// PUBLISH EXAM RESULTS (HOD & Exam Officer only)
// ============================================
exports.publishResults = async (req, res) => {
    try {
        const { examId } = req.params;
        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        exam.status = "published";
        await exam.save();

        // Update GPA for all students who sat this exam
        const examResults = await Result.find({ examId });
        for (const resItem of examResults) {
            const studentId = resItem.studentId;

            // Fetch all published exam results for this student
            const studentExams = await Exam.find({ status: "published" });
            const examIds = studentExams.map(e => e._id);

            const allResults = await Result.find({
                studentId,
                examId: { $in: examIds }
            }).populate("examId");

            if (allResults.length > 0) {
                // Fetch course credits to weight the GPA calculation
                let totalPoints = 0;
                let totalCredits = 0;

                for (const r of allResults) {
                    const course = await Course.findById(r.examId.courseId);
                    if (course) {
                        totalPoints += r.gradePoints * course.credits;
                        totalCredits += course.credits;
                    }
                }

                const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0.0;

                await Student.findOneAndUpdate(
                    { userId: studentId },
                    { gpa: parseFloat(gpa.toFixed(2)) },
                    { upsert: true }
                );
            }
        }

        await logAudit("PUBLISH_EXAM_RESULTS", `Published results for exam: ${exam.name}`, req.user.id, req.ip);

        res.status(200).json({ success: true, message: "Exam results published and student GPAs recalculated!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET RESULTS FOR A SPECIFIC EXAM
// ============================================
exports.getExamResults = async (req, res) => {
    try {
        const { examId } = req.params;
        const exam = await Exam.findById(examId).populate("courseId", "code name");
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        // Access checks
        if (req.user.role === "student") {
            const result = await Result.findOne({ examId, studentId: req.user.id });
            if (exam.status !== "published") {
                return res.status(403).json({ success: false, message: "Results are not published yet" });
            }
            return res.status(200).json({ success: true, data: result ? [result] : [] });
        }

        // Lecturers, HODs, Exam Officers can view all
        const results = await Result.find({ examId })
            .populate("studentId", "name email registrationNumber");

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET STUDENT REPORT CARD & GPA (Student Dashboard)
// ============================================
exports.getStudentReportCard = async (req, res) => {
    try {
        const studentId = req.user.role === "student" ? req.user.id : req.query.studentId;

        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID required" });
        }

        const studentProfile = await Student.findOne({ userId: studentId }).populate("userId", "name email registrationNumber department");

        // Fetch published exams
        const publishedExams = await Exam.find({ status: "published" });
        const examIds = publishedExams.map(e => e._id);

        const results = await Result.find({
            studentId,
            examId: { $in: examIds }
        }).populate({
            path: "examId",
            populate: { path: "courseId", select: "code name credits" }
        });

        res.status(200).json({
            success: true,
            data: {
                profile: studentProfile,
                results: results.map(r => ({
                    examName: r.examId.name,
                    courseCode: r.examId.courseId.code,
                    courseName: r.examId.courseId.name,
                    credits: r.examId.courseId.credits,
                    score: r.score,
                    totalMarks: r.totalMarks,
                    grade: r.grade,
                    gradePoints: r.gradePoints
                })),
                gpa: studentProfile ? studentProfile.gpa : 0.0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GENERATE PRINT-FRIENDLY TRANSCRIPT
// ============================================
exports.generateTranscript = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const studentProfile = await Student.findOne({ userId: studentId });

        // Retrieve all completed course enrollments with grade
        const enrollments = await Enrollment.find({ studentId, status: "approved" })
            .populate("courseId", "code name credits semester");

        const publishedExams = await Exam.find({ status: "published" });
        const examIds = publishedExams.map(e => e._id);

        const examResults = await Result.find({
            studentId,
            examId: { $in: examIds }
        }).populate("examId");

        // Map courses to their published exam grade
        const transcriptCourses = enrollments.map(enroll => {
            const courseResult = examResults.find(r => r.examId.courseId.toString() === enroll.courseId._id.toString());
            return {
                code: enroll.courseId.code,
                name: enroll.courseId.name,
                credits: enroll.courseId.credits,
                semester: enroll.courseId.semester,
                grade: courseResult ? courseResult.grade : "In Progress",
                gradePoints: courseResult ? courseResult.gradePoints : null
            };
        });

        res.status(200).json({
            success: true,
            data: {
                student: {
                    name: student.name,
                    email: student.email,
                    registrationNumber: student.registrationNumber,
                    department: student.department
                },
                courses: transcriptCourses,
                gpa: studentProfile ? studentProfile.gpa : 0.0,
                institute: "Swami Vipulananda Institute of Aesthetic Studies",
                affiliation: "Eastern University, Sri Lanka",
                generatedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
