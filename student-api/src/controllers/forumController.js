const ForumThread = require("../models/ForumThread");
const ForumComment = require("../models/ForumComment");
const Course = require("../models/Course");

// ============================================
// CREATE DISCUSSION THREAD
// ============================================
exports.createThread = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const authorId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const thread = await ForumThread.create({
            courseId,
            title,
            content,
            authorId
        });

        const populatedThread = await ForumThread.findById(thread._id)
            .populate("authorId", "name role profilePicture");

        res.status(201).json({
            success: true,
            message: "Discussion thread posted successfully!",
            data: populatedThread
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET THREADS BY COURSE
// ============================================
exports.getThreadsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { search } = req.query;
        let query = { courseId };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        const threads = await ForumThread.find(query)
            .populate("authorId", "name role profilePicture")
            .sort("-createdAt");

        res.status(200).json({
            success: true,
            count: threads.length,
            data: threads
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET SINGLE THREAD & ITS COMMENTS
// ============================================
exports.getThreadDetails = async (req, res) => {
    try {
        const thread = await ForumThread.findById(req.params.threadId)
            .populate("authorId", "name role profilePicture");

        if (!thread) {
            return res.status(404).json({ success: false, message: "Thread not found" });
        }

        const comments = await ForumComment.find({ threadId: thread._id })
            .populate("authorId", "name role profilePicture")
            .sort("createdAt");

        res.status(200).json({
            success: true,
            data: {
                thread,
                comments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// POST COMMENT TO THREAD
// ============================================
exports.createComment = async (req, res) => {
    try {
        const { threadId, content, parentId } = req.body;
        const authorId = req.user.id;

        const comment = await ForumComment.create({
            threadId,
            content,
            authorId,
            parentId: parentId || null
        });

        const populatedComment = await ForumComment.findById(comment._id)
            .populate("authorId", "name role profilePicture");

        res.status(201).json({
            success: true,
            message: "Comment posted!",
            data: populatedComment
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE THREAD (Author, Assigned Lecturer, or Admin only)
// ============================================
exports.deleteThread = async (req, res) => {
    try {
        const thread = await ForumThread.findById(req.params.threadId).populate("courseId", "lecturerId");
        if (!thread) {
            return res.status(404).json({ success: false, message: "Thread not found" });
        }

        const isAuthor = thread.authorId.toString() === req.user.id;
        const isLecturer = thread.courseId?.lecturerId?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isLecturer && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this thread" });
        }

        await ForumThread.findByIdAndDelete(req.params.threadId);
        await ForumComment.deleteMany({ threadId: req.params.threadId });

        res.status(200).json({ success: true, message: "Thread deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE COMMENT (Author, Assigned Lecturer, or Admin only)
// ============================================
exports.deleteComment = async (req, res) => {
    try {
        const comment = await ForumComment.findById(req.params.commentId).populate({
            path: "threadId",
            populate: { path: "courseId", select: "lecturerId" }
        });

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const isAuthor = comment.authorId.toString() === req.user.id;
        const isLecturer = comment.threadId?.courseId?.lecturerId?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isLecturer && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
        }

        await ForumComment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
