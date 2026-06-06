const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// ============================================
// MARK ATTENDANCE (Lecturer only)
// ============================================
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, records } = req.body; // records: Array of { studentId, status: 'present'/'absent'/'late' }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Authorize
        if (req.user.role !== "admin" && course.lecturerId?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setUTCHours(0,0,0,0); // Clear hours/minutes for date comparison

        // Check if attendance already marked for this date
        let attendance = await Attendance.findOne({
            courseId,
            date: attendanceDate
        });

        if (attendance) {
            // Overwrite existing record sheet
            attendance.records = records;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                courseId,
                date: attendanceDate,
                records
            });
        }

        res.status(200).json({
            success: true,
            message: "Attendance marked successfully!",
            data: attendance
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET COURSE ATTENDANCE RECORDS (Lecturer & Student view)
// ============================================
exports.getAttendanceRecords = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const sheets = await Attendance.find({ courseId }).sort("date");

        if (req.user.role === "student") {
            // For students: Return their specific check-in records only
            const studentId = req.user.id;
            const studentLogs = sheets.map(sheet => {
                const record = sheet.records.find(r => r.studentId.toString() === studentId.toString());
                return {
                    date: sheet.date,
                    status: record ? record.status : "unmarked"
                };
            });

            // Calculate percentage
            const totalClasses = studentLogs.filter(l => l.status !== "unmarked").length;
            const presentClasses = studentLogs.filter(l => l.status === "present").length;
            const lateClasses = studentLogs.filter(l => l.status === "late").length;
            
            // Treat late check-ins as 0.5 present (optional, standard academic practice)
            const attendancePercentage = totalClasses > 0 
                ? Math.round(((presentClasses + (lateClasses * 0.5)) / totalClasses) * 100)
                : 100;

            return res.status(200).json({
                success: true,
                percentage: attendancePercentage,
                data: studentLogs
            });
        }

        // Lecturers: return the complete roster lists
        res.status(200).json({
            success: true,
            data: sheets
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET STUDENTS ATTENDANCE STATS (Lecturer Roster View)
// ============================================
exports.getCourseAttendanceStats = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Fetch enrolled students
        const enrollments = await Enrollment.find({ courseId, status: "approved" }).populate("studentId", "name studentId email");
        const enrolledStudents = enrollments.map(e => e.studentId).filter(s => s !== null);

        // Fetch attendance sheets
        const sheets = await Attendance.find({ courseId });

        const stats = enrolledStudents.map(student => {
            let present = 0;
            let absent = 0;
            let late = 0;
            let unmarked = 0;

            sheets.forEach(sheet => {
                const rec = sheet.records.find(r => r.studentId.toString() === student._id.toString());
                if (rec) {
                    if (rec.status === "present") present++;
                    else if (rec.status === "absent") absent++;
                    else if (rec.status === "late") late++;
                } else {
                    unmarked++;
                }
            });

            const totalMarked = present + absent + late;
            const percentage = totalMarked > 0
                ? Math.round(((present + (late * 0.5)) / totalMarked) * 100)
                : 100;

            return {
                studentId: student.studentId,
                name: student.name,
                email: student.email,
                id: student._id,
                present,
                absent,
                late,
                percentage
            };
        });

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
