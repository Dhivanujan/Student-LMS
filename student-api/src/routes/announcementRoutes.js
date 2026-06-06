const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncementFeed, getCourseAnnouncements, deleteAnnouncement } = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorize("lecturer", "admin"), createAnnouncement);

router.get("/feed", protect, getAnnouncementFeed);
router.get("/course/:courseId", protect, getCourseAnnouncements);
router.delete("/:id", protect, authorize("lecturer", "admin"), deleteAnnouncement);

module.exports = router;
