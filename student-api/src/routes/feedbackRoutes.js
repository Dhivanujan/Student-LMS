const express = require("express");
const router = express.Router();
const {
    submitFeedback,
    getFeedbacks
} = require("../controllers/feedbackController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .post(authorize("student"), submitFeedback)
    .get(authorize("admin", "hod", "lecturer"), getFeedbacks);

module.exports = router;
