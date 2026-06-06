const express = require("express");
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, assignLecturer, deleteCourse, uploadMaterial, deleteMaterial } = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.route("/")
    .get(protect, getCourses)
    .post(protect, authorize("admin"), createCourse);

router.route("/:id")
    .get(protect, getCourseById)
    .put(protect, authorize("admin"), updateCourse)
    .delete(protect, authorize("admin"), deleteCourse);

router.put("/:id/assign-lecturer", protect, authorize("admin"), assignLecturer);

// Materials routes
router.post("/:id/materials", protect, authorize("lecturer", "admin"), upload.single("materialFile"), uploadMaterial);
router.delete("/:id/materials/:materialId", protect, authorize("lecturer", "admin"), deleteMaterial);

module.exports = router;
