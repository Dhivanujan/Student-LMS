const express = require("express");
const router = express.Router();
const { getMyNotifications, markAllAsRead, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(getMyNotifications)
    .put(markAllAsRead);

router.put("/:id/read", markAsRead);

module.exports = router;
