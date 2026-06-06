const express = require("express");
const router = Router = express.Router();
const { markAttendance, getAttendanceRecords, getCourseAttendanceStats } = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("lecturer", "admin"), markAttendance);
router.get("/course/:courseId", protect, getAttendanceRecords);
router.get("/course/:courseId/stats", protect, authorize("lecturer", "admin"), getCourseAttendanceStats);

module.exports = router;
