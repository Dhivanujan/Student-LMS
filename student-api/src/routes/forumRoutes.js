const express = require("express");
const router = express.Router();
const { createThread, getThreadsByCourse, getThreadDetails, createComment, deleteThread, deleteComment } = require("../controllers/forumController");
const { protect } = require("../middleware/authMiddleware");

router.route("/threads")
    .post(protect, createThread);

router.get("/course/:courseId", protect, getThreadsByCourse);

router.route("/threads/:threadId")
    .get(protect, getThreadDetails)
    .delete(protect, deleteThread);

router.route("/comments")
    .post(protect, createComment);

router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;
