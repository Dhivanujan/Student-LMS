const express = require("express");
const router = express.Router();
const { getAdminMetrics, getLecturerMetrics, getStudentMetrics, exportReport } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/admin", protect, authorize("admin"), getAdminMetrics);
router.get("/lecturer", protect, authorize("lecturer", "admin"), getLecturerMetrics);
router.get("/student", protect, authorize("student"), getStudentMetrics);
router.get("/export", protect, exportReport);

module.exports = router;
