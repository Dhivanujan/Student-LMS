const Notification = require("../models/Notification");

// ============================================
// GET MY NOTIFICATIONS
// ============================================
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort("-createdAt")
            .limit(50);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// MARK ALL AS READ
// ============================================
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// MARK SINGLE NOTIFICATION AS READ
// ============================================
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
